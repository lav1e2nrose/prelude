import { useEffect, useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplanationTrigger } from '../../components/shared/ExplanationTrigger'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import { useMemorialWorkflowStore } from '../../store'
import type { AdverseOutcomeType } from '../../types/memorial'
import type { EHGFrame } from '../../types/signal'

const basePatients = [
  { id: 'P-001', name: '患者 A', week: '26+4', level: 'attention' as const, status: 'monitoring' as const },
  { id: 'P-002', name: '患者 B', week: '32+3', level: 'alert' as const, status: 'monitoring' as const },
  { id: 'P-003', name: '患者 C', week: '35+1', level: 'safe' as const, status: 'monitoring' as const }
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

export const PatientList = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(basePatients[0]?.id ?? null)
  const [activeTab, setActiveTab] = useState<'monitoring' | 'ended' | 'memorial'>('monitoring')
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
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
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
        item.id === 'P-002'
          ? {
              ...item,
              status: trackedPatientStatus
            }
          : item
      ),
    [trackedPatientStatus]
  )

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null
  const syncTargetPatient = selectedPatient ?? patients.find((patient) => patient.id === 'P-002') ?? patients[0] ?? null
  const filteredPatients = patients.filter((patient) => patient.status === activeTab)

  const explanation = useMemo(() => {
    if (!selectedPatient) return null
    const frame: EHGFrame = {
      timestamp: 1760000000000,
      ehg: [0.03, 0.08, 0.05, 0.02, 0.06, 0.01],
      maternalHR: selectedPatient.level === 'alert' ? 98 : 86,
      imu: {
        ax: 0.2,
        ay: 0.4,
        az: 0.6,
        gx: 0.01,
        gy: 0.03,
        gz: 0.02
      },
      electrodeQuality: selectedPatient.level === 'alert' ? 78 : 90,
      batteryLevel: 81,
      posture: 'lying_left'
    }
    return explainabilityEngine.generateExplanation(frame)
  }, [selectedPatient])

  const secondsLeft = doctorPendingSync.executeAt ? Math.max(0, Math.ceil((doctorPendingSync.executeAt - now) / 1000)) : 0

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">患者总览</div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            { key: 'monitoring', label: `在监测 (${patients.filter((item) => item.status === 'monitoring').length})` },
            { key: 'ended', label: `已结束 (${patients.filter((item) => item.status === 'ended').length})` },
            { key: 'memorial', label: `静默中 (${patients.filter((item) => item.status === 'memorial').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'monitoring' | 'ended' | 'memorial')}
              className={`rounded-[var(--radius-control)] border px-3 py-1.5 ${
                activeTab === tab.key
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'memorial' ? (
          <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">
            静默中患者建议：7 天内电话随访并确认是否需要恢复常规监测。
          </div>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">医生代操作通道（D）</div>
        <div className="mt-2 text-xs text-slate-400">EMR 录入结局后可在 60 秒内撤销，避免误录入导致错误同步。</div>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <select
            value={doctorOutcomeType}
            onChange={(event) => setDoctorOutcomeType(event.target.value as AdverseOutcomeType)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            {Object.entries(outcomeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => startDoctorSyncWindow(doctorOutcomeType)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
          >
            开始 60 秒同步窗口
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
            <div>患者：{syncTargetPatient?.name ?? '当前患者'}</div>
            <div>录入结局：{outcomeLabels[doctorPendingSync.outcomeType]}</div>
            <div>倒计时：{secondsLeft}s 后自动执行</div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={doctorPendingSync.autoFollowupIn7Days}
                onChange={(event) => setDoctorFollowupOption(event.target.checked)}
              />
              自动安排 7 天后的随访（默认不勾选）
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelDoctorSyncWindow}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={executeDoctorSync}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300"
              >
                立即执行
              </button>
            </div>
          </div>
        ) : null}
        {doctorVisibleNotice ? <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">{doctorVisibleNotice}</div> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <div className="space-y-3">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`flex items-center justify-between rounded-[var(--radius-card)] border p-4 ${
                  selectedPatientId === patient.id
                    ? 'border-[var(--accent)]/60 bg-[var(--accent-dim)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-1)]'
                }`}
              >
                <div>
                  <div className="text-sm text-slate-400">{patient.id}</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">{patient.name}</div>
                  <div className="text-xs text-slate-400">
                    {activeTab === 'memorial' ? '静默原因：见协同日志 · 建议 7 天后随访' : `孕周 ${patient.week}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusOrb level={patient.level} label="风险状态" />
                  <ExplanationTrigger onClick={() => setSelectedPatientId(patient.id)} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-400">
              当前分类暂无患者。
            </div>
          )}
        </div>
        <div className="space-y-4">
          {selectedPatient ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
              <div className="mb-2 text-sm text-slate-300">
                临床解释 · {selectedPatient.name}（{selectedPatient.id}）
              </div>
              {explanation ? <ExplainabilityPanel explanation={explanation} /> : null}
              <div className="mt-3 text-xs text-slate-400">
                医生端始终可见完整既往数据；患者端是否引用由其在“我有了新的开始”中自行决定。
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-300">
              选择患者以查看临床解释与风险来源。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
