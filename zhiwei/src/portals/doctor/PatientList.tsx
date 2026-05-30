import { useEffect, useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplanationTrigger } from '../../components/shared/ExplanationTrigger'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import { useMemorialWorkflowStore } from '../../store'
import type { AdverseOutcomeType } from '../../types/memorial'
import type { EHGFrame, RiskLevel } from '../../types/signal'

type PatientStatus = 'monitoring' | 'ended' | 'memorial'

interface PatientRow {
  id: string
  name: string
  week: string
  riskFactors: string[]
  contractionRate: string
  risk7d: number
  level: RiskLevel
  status: PatientStatus
}

const basePatients: PatientRow[] = [
  { id: 'P-001', name: '赵女士', week: '27+6', riskFactors: ['双胎', '高龄'], contractionRate: '4 次/h', risk7d: 24.1, level: 'alert', status: 'monitoring' },
  { id: 'P-002', name: '张小雅', week: '32+3', riskFactors: ['高龄', '试管'], contractionRate: '1 次/h', risk7d: 5.8, level: 'attention', status: 'monitoring' },
  { id: 'P-003', name: '李女士', week: '29+5', riskFactors: ['双胎', '宫颈机能不全'], contractionRate: '3 次/h', risk7d: 18.3, level: 'alert', status: 'monitoring' },
  { id: 'P-004', name: '周女士', week: '30+2', riskFactors: ['宫颈机能不全'], contractionRate: '2 次/h', risk7d: 9.6, level: 'attention', status: 'monitoring' },
  { id: 'P-005', name: '吴女士', week: '33+1', riskFactors: ['早产史'], contractionRate: '0.5 次/h', risk7d: 3.1, level: 'safe', status: 'monitoring' },
  { id: 'P-006', name: '郑女士', week: '28+4', riskFactors: ['高龄', '宫颈机能不全', '试管'], contractionRate: '2.5 次/h', risk7d: 14.7, level: 'attention', status: 'monitoring' },
  { id: 'P-007', name: '王女士', week: '34+1', riskFactors: ['早产史'], contractionRate: '0 次/h', risk7d: 1.2, level: 'safe', status: 'monitoring' },
  { id: 'P-008', name: '钱女士', week: '36+0', riskFactors: ['试管', '高龄'], contractionRate: '0.5 次/h', risk7d: 3.1, level: 'safe', status: 'monitoring' }
]

const explainabilityEngine = new ExplainabilityEngine()

const outcomeLabels: Record<AdverseOutcomeType, string> = {
  early_miscarriage: '早期妊娠终止',
  late_miscarriage: '中晚期妊娠终止',
  iufd: '胎死宫内 (IUFD)',
  medical_termination: '医学原因终止妊娠',
  selective_reduction: '选择性减胎',
  neonatal_death: '新生儿离世',
  unknown: '其他未分类原因',
  user_choice_other: '患者自定义原因'
}

const levelBadge: Record<RiskLevel, { label: string; cls: string }> = {
  safe: { label: '平稳', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
  attention: { label: '留意', cls: 'text-amber-300 bg-amber-500/10 border-amber-400/20' },
  alert: { label: '警示', cls: 'text-rose-300 bg-rose-500/10 border-rose-400/20' },
  emergency: { label: '紧急', cls: 'text-red-200 bg-red-500/15 border-red-400/30' }
}

export const PatientList = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(basePatients[0]?.id ?? null)
  const [activeTab, setActiveTab] = useState<PatientStatus>('monitoring')
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const [now, setNow] = useState(() => Date.now())
  const [doctorOutcomeType, setDoctorOutcomeType] = useState<AdverseOutcomeType>('iufd')

  const trackedPatientStatus = useMemorialWorkflowStore((state) => state.trackedPatientStatus)
  const doctorPendingSync = useMemorialWorkflowStore((state) => state.doctorPendingSync)
  const doctorVisibleNotice = useMemorialWorkflowStore((state) => state.doctorVisibleNotice)
  const startDoctorSyncWindow = useMemorialWorkflowStore((state) => state.startDoctorSyncWindow)
  const cancelDoctorSyncWindow = useMemorialWorkflowStore((state) => state.cancelDoctorSyncWindow)
  const executeDoctorSync = useMemorialWorkflowStore((state) => state.executeDoctorSync)
  const setDoctorFollowupOption = useMemorialWorkflowStore((state) => state.setDoctorFollowupOption)

  useEffect(() => {
    if (!doctorPendingSync.active) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [doctorPendingSync.active])

  useEffect(() => {
    if (!doctorPendingSync.active || !doctorPendingSync.executeAt) return
    if (now < doctorPendingSync.executeAt) return
    executeDoctorSync()
  }, [doctorPendingSync.active, doctorPendingSync.executeAt, executeDoctorSync, now])

  const patients = useMemo(
    () =>
      basePatients.map((item) =>
        item.id === 'P-002' ? { ...item, status: trackedPatientStatus } : item
      ),
    [trackedPatientStatus]
  )

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null
  const syncTargetPatient = selectedPatient ?? patients.find((p) => p.id === 'P-002') ?? patients[0] ?? null

  const filteredPatients = patients.filter((p) => {
    if (p.status !== activeTab) return false
    if (filterLevel !== 'all' && p.level !== filterLevel) return false
    return true
  })

  const sortedPatients = [...filteredPatients].sort((a, b) => b.risk7d - a.risk7d)

  const explanation = useMemo(() => {
    if (!selectedPatient) return null
    const frame: EHGFrame = {
      timestamp: 1760000000000,
      ehg: [0.03, 0.08, 0.05, 0.02, 0.06, 0.01],
      maternalHR: selectedPatient.level === 'alert' ? 98 : 86,
      imu: { ax: 0.2, ay: 0.4, az: 0.6, gx: 0.01, gy: 0.03, gz: 0.02 },
      electrodeQuality: selectedPatient.level === 'alert' ? 78 : 90,
      batteryLevel: 81,
      posture: 'lying_left'
    }
    return explainabilityEngine.generateExplanation(frame)
  }, [selectedPatient])

  const secondsLeft = doctorPendingSync.executeAt
    ? Math.max(0, Math.ceil((doctorPendingSync.executeAt - now) / 1000))
    : 0

  const tabCounts = {
    monitoring: patients.filter((p) => p.status === 'monitoring').length,
    ended: patients.filter((p) => p.status === 'ended').length,
    memorial: patients.filter((p) => p.status === 'memorial').length
  }

  return (
    <div className="space-y-4">
      {/* 今日紧急队列 */}
      {patients.filter((p) => p.level === 'alert' || p.level === 'emergency').length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--alert)]/20 bg-[var(--alert)]/5 px-4 py-3">
          <div className="text-xs font-medium text-rose-300">今日紧急队列</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {patients
              .filter((p) => p.level === 'alert' || p.level === 'emergency')
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPatientId(p.id); setActiveTab('monitoring') }}
                  className="rounded-full border border-[var(--alert)]/30 bg-[var(--alert)]/10 px-3 py-1 text-xs text-rose-200"
                >
                  {p.name} · {p.week} · {p.risk7d}%
                </button>
              ))}
          </div>
        </div>
      ) : null}

      {/* 医生代操作通道（D） */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">医生代操作通道（D）· EMR 结局录入</div>
          <div className="text-xs text-slate-500">60 秒内可撤销，防误录入</div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <select
            value={doctorOutcomeType}
            onChange={(e) => setDoctorOutcomeType(e.target.value as AdverseOutcomeType)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            {Object.entries(outcomeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => startDoctorSyncWindow(doctorOutcomeType)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
          >
            开始 60s 同步窗口
          </button>
          <button
            type="button"
            onClick={executeDoctorSync}
            className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-2 text-xs text-white"
          >
            立即执行
          </button>
        </div>
        {doctorPendingSync.active ? (
          <div className="mt-3 space-y-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3 text-xs text-slate-300">
            <div>患者：{syncTargetPatient?.name ?? '当前患者'} · 结局：{outcomeLabels[doctorPendingSync.outcomeType]}</div>
            <div className="font-medium text-amber-300">倒计时 {secondsLeft}s 后自动执行</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={doctorPendingSync.autoFollowupIn7Days} onChange={(e) => setDoctorFollowupOption(e.target.checked)} />
              自动安排 7 天后的随访（默认不勾选）
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={cancelDoctorSyncWindow} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300">取消</button>
              <button type="button" onClick={executeDoctorSync} className="rounded-[var(--radius-control)] bg-[var(--alert)] px-3 py-1.5 text-xs text-white">立即执行</button>
            </div>
          </div>
        ) : null}
        {doctorVisibleNotice ? <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">{doctorVisibleNotice}</div> : null}
      </div>

      {/* 患者列表 + 可解释性面板 */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1.4fr]">
        <div className="space-y-3">
          {/* Tab + 筛选 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 text-xs">
              {(['monitoring', 'ended', 'memorial'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-[var(--radius-control)] border px-3 py-1.5 transition ${
                    activeTab === tab
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-slate-400'
                  }`}
                >
                  {tab === 'monitoring' ? `在监测 (${tabCounts.monitoring})` : tab === 'ended' ? `已结束 (${tabCounts.ended})` : `静默中 (${tabCounts.memorial})`}
                </button>
              ))}
            </div>
            <div className="flex gap-1 text-xs">
              {(['all', 'alert', 'attention', 'safe'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`rounded-full border px-2.5 py-1 transition ${
                    filterLevel === lvl
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-white'
                      : 'border-[var(--border-subtle)] text-slate-500'
                  }`}
                >
                  {lvl === 'all' ? '全部' : lvl === 'alert' ? '警示' : lvl === 'attention' ? '留意' : '平稳'}
                </button>
              ))}
            </div>
          </div>

          {/* 表头 */}
          <div className="grid grid-cols-[1.2fr_0.7fr_1fr_0.8fr_0.7fr_auto] gap-2 rounded-[var(--radius-control)] bg-[var(--bg-2)]/50 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500">
            <span>姓名</span>
            <span>孕周</span>
            <span>高危因素</span>
            <span>宫缩</span>
            <span>7d 风险</span>
            <span>状态</span>
          </div>

          {/* 行 */}
          <div className="space-y-1.5">
            {sortedPatients.length > 0 ? (
              sortedPatients.map((patient) => {
                const badge = levelBadge[patient.level]
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`grid w-full grid-cols-[1.2fr_0.7fr_1fr_0.8fr_0.7fr_auto] items-center gap-2 rounded-[var(--radius-card)] border p-3 text-left transition ${
                      selectedPatientId === patient.id
                        ? 'border-[var(--accent)]/60 bg-[var(--accent-dim)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-1)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{patient.name}</div>
                      <div className="text-[11px] text-slate-500">{patient.id}</div>
                    </div>
                    <div className="text-sm text-slate-300">{patient.week}</div>
                    <div className="flex flex-wrap gap-1">
                      {patient.riskFactors.map((f) => (
                        <span key={f} className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-1.5 py-0.5 text-[10px] text-slate-400">{f}</span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-300">{patient.contractionRate}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[var(--text-primary)]">{patient.risk7d}%</span>
                      <ExplanationTrigger onClick={() => setSelectedPatientId(patient.id)} />
                    </div>
                    <div className={`rounded-full border px-2 py-0.5 text-[11px] ${badge.cls}`}>{badge.label}</div>
                  </button>
                )
              })
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-400">
                当前分类暂无患者。
              </div>
            )}
          </div>

          {activeTab === 'memorial' ? (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">
              静默中患者建议：7 天内电话随访并确认是否需要恢复常规监测。
            </div>
          ) : null}
        </div>

        {/* 可解释性面板 */}
        <div>
          {selectedPatient && explanation ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">临床解释 · {selectedPatient.name}（{selectedPatient.id}）孕 {selectedPatient.week}</div>
              <ExplainabilityPanel explanation={explanation} />
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-500">
                医生端始终可见完整既往数据；患者端是否引用由其在"我有了新的开始"中自行决定。
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-400">
              选择患者以查看临床解释与风险来源。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
