import { useEffect, useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplanationTrigger } from '../../components/shared/ExplanationTrigger'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import { LEVEL_BADGE } from '../../data/doctorPatients'
import { useMemorialWorkflowStore } from '../../store'
import { useDoctorStore, type NewPatientInput } from '../../store/doctor'
import { toast } from '../../store/toast'
import type { AdverseOutcomeType } from '../../types/memorial'
import type { EHGFrame, RiskLevel } from '../../types/signal'

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

const RISK_FACTOR_CHOICES = ['高龄', '试管', '双胎', '多胎', '宫颈机能不全', '早产史', '妊娠糖尿病', '妊娠高血压']

export const PatientList = () => {
  const patients = useDoctorStore((s) => s.patients)
  const selectedPatientId = useDoctorStore((s) => s.selectedPatientId)
  const setSelectedPatient = useDoctorStore((s) => s.setSelectedPatient)
  const addPatient = useDoctorStore((s) => s.addPatient)

  const [activeTab, setActiveTab] = useState<'monitoring' | 'ended' | 'memorial'>('monitoring')
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const [now, setNow] = useState(() => Date.now())
  const [doctorOutcomeType, setDoctorOutcomeType] = useState<AdverseOutcomeType>('iufd')
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<NewPatientInput>({ name: '', week: '', riskFactors: [], level: 'attention' })

  const trackedPatientStatus = useMemorialWorkflowStore((s) => s.trackedPatientStatus)
  const doctorPendingSync = useMemorialWorkflowStore((s) => s.doctorPendingSync)
  const doctorVisibleNotice = useMemorialWorkflowStore((s) => s.doctorVisibleNotice)
  const startDoctorSyncWindow = useMemorialWorkflowStore((s) => s.startDoctorSyncWindow)
  const cancelDoctorSyncWindow = useMemorialWorkflowStore((s) => s.cancelDoctorSyncWindow)
  const executeDoctorSync = useMemorialWorkflowStore((s) => s.executeDoctorSync)
  const setDoctorFollowupOption = useMemorialWorkflowStore((s) => s.setDoctorFollowupOption)

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

  // 记忆模式同步：受监测患者 P-002 的状态随工作流变化
  const merged = useMemo(
    () => patients.map((p) => (p.id === 'P-002' ? { ...p, status: trackedPatientStatus } : p)),
    [patients, trackedPatientStatus]
  )

  const selectedPatient = merged.find((p) => p.id === selectedPatientId) ?? null
  const filtered = merged
    .filter((p) => p.status === activeTab && (filterLevel === 'all' || p.level === filterLevel))
    .sort((a, b) => b.risk7d - a.risk7d)

  const explanation = useMemo(() => {
    if (!selectedPatient) return null
    const frame: EHGFrame = {
      timestamp: 0,
      ehg: [0.03, 0.08, 0.05, 0.02],
      maternalHR: selectedPatient.level === 'alert' ? 98 : 86,
      imu: { ax: 0.2, ay: 0.4, az: 0.6, gx: 0.01, gy: 0.03, gz: 0.02 },
      electrodeQuality: 90,
      batteryLevel: 81,
      posture: 'lying_left'
    }
    // 关键：以该患者真实的 7d 风险为锚，保证摘要与列表数值一致
    return explainabilityEngine.generateExplanation(frame, {
      riskScore: selectedPatient.risk7d,
      riskFactors: selectedPatient.riskFactors
    })
  }, [selectedPatient])

  const secondsLeft = doctorPendingSync.executeAt ? Math.max(0, Math.ceil((doctorPendingSync.executeAt - now) / 1000)) : 0
  const tabCounts = {
    monitoring: merged.filter((p) => p.status === 'monitoring').length,
    ended: merged.filter((p) => p.status === 'ended').length,
    memorial: merged.filter((p) => p.status === 'memorial').length
  }
  const urgent = merged.filter((p) => p.level === 'alert' || p.level === 'emergency')

  const toggleDraftFactor = (f: string) =>
    setDraft((d) => ({ ...d, riskFactors: d.riskFactors.includes(f) ? d.riskFactors.filter((x) => x !== f) : [...d.riskFactors, f] }))

  const submitNewPatient = () => {
    if (!draft.name.trim()) return
    addPatient(draft)
    toast.success('已添加患者', `${draft.name} 已加入在监测队列`)
    setDraft({ name: '', week: '', riskFactors: [], level: 'attention' })
    setAddOpen(false)
    setActiveTab('monitoring')
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-8 text-center">
        <div className="text-sm text-slate-300">暂无患者数据</div>
        <div className="mt-2 text-xs text-slate-500">真实模式下患者队列来自后端。可在设置中开启演示模式查看示例数据。</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {urgent.length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--alert)]/20 bg-[var(--alert)]/5 px-4 py-3">
          <div className="text-xs font-medium text-rose-300">今日紧急队列</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {urgent.map((p) => (
              <button key={p.id} type="button" onClick={() => { setSelectedPatient(p.id); setActiveTab('monitoring') }} className="rounded-full border border-[var(--alert)]/30 bg-[var(--alert)]/10 px-3 py-1 text-xs text-rose-200">
                {p.name} · {p.week} · {p.risk7d}%
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1.4fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 text-xs">
              {(['monitoring', 'ended', 'memorial'] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-[var(--radius-control)] border px-3 py-1.5 transition ${activeTab === tab ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-slate-400'}`}>
                  {tab === 'monitoring' ? `在监测 (${tabCounts.monitoring})` : tab === 'ended' ? `已结束 (${tabCounts.ended})` : `静默中 (${tabCounts.memorial})`}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAddOpen(true)} className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1.5 text-xs text-white transition hover:brightness-110">
              + 添加患者
            </button>
          </div>

          <div className="flex gap-1 text-xs">
            {(['all', 'alert', 'attention', 'safe'] as const).map((lvl) => (
              <button key={lvl} type="button" onClick={() => setFilterLevel(lvl)} className={`rounded-full border px-2.5 py-1 transition ${filterLevel === lvl ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-white' : 'border-[var(--border-subtle)] text-slate-500'}`}>
                {lvl === 'all' ? '全部' : lvl === 'alert' ? '警示' : lvl === 'attention' ? '留意' : '平稳'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1.2fr_0.7fr_1fr_0.8fr_0.7fr_auto] gap-2 rounded-[var(--radius-control)] bg-[var(--bg-2)]/50 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500">
            <span>姓名</span><span>孕周</span><span>高危因素</span><span>宫缩</span><span>7d 风险</span><span>状态</span>
          </div>

          <div className="space-y-1.5">
            {filtered.length > 0 ? (
              filtered.map((patient) => {
                const badge = LEVEL_BADGE[patient.level]
                return (
                  <button key={patient.id} type="button" onClick={() => setSelectedPatient(patient.id)} className={`grid w-full grid-cols-[1.2fr_0.7fr_1fr_0.8fr_0.7fr_auto] items-center gap-2 rounded-[var(--radius-card)] border p-3 text-left transition ${selectedPatientId === patient.id ? 'border-[var(--accent)]/60 bg-[var(--accent-dim)]' : 'border-[var(--border-subtle)] bg-[var(--bg-1)] hover:border-[var(--border-default)]'}`}>
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
                      <ExplanationTrigger onClick={() => setSelectedPatient(patient.id)} />
                    </div>
                    <div className={`rounded-full border px-2 py-0.5 text-[11px] ${badge.cls}`}>{badge.label}</div>
                  </button>
                )
              })
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-400">当前分类暂无患者。</div>
            )}
          </div>

          {activeTab === 'memorial' ? (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">静默中患者建议：7 天内电话随访并确认是否需要恢复常规监测。</div>
          ) : null}
        </div>

        <div>
          {selectedPatient && explanation ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">临床解释 · {selectedPatient.name}（{selectedPatient.id}）孕 {selectedPatient.week} · 7d 风险 {selectedPatient.risk7d}%</div>
              <ExplainabilityPanel explanation={explanation} />
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-sm text-slate-400">选择患者以查看临床解释与风险来源。</div>
          )}
        </div>
      </div>

      {/* 医生代操作通道（D）· EMR 结局录入 —— 不常用，置于页面底部 */}
      <details className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]">
        <summary className="cursor-pointer px-4 py-3 text-sm text-slate-300">医生代操作通道（D）· EMR 结局录入<span className="ml-2 text-xs text-slate-500">（不常用，点击展开）</span></summary>
        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="text-xs text-slate-400">录入妊娠结局后可在 60 秒内撤销，避免误录入导致错误同步。当前对象：{selectedPatient?.name ?? '未选择'}</div>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <select value={doctorOutcomeType} onChange={(e) => setDoctorOutcomeType(e.target.value as AdverseOutcomeType)} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]">
              {Object.entries(outcomeLabels).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
            </select>
            <button type="button" onClick={() => startDoctorSyncWindow(doctorOutcomeType)} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200">开始 60s 同步窗口</button>
            <button type="button" onClick={executeDoctorSync} className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-2 text-xs text-white">立即执行</button>
          </div>
          {doctorPendingSync.active ? (
            <div className="mt-3 space-y-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3 text-xs text-slate-300">
              <div>结局：{outcomeLabels[doctorPendingSync.outcomeType]} · 倒计时 <span className="font-medium text-amber-300">{secondsLeft}s</span></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={doctorPendingSync.autoFollowupIn7Days} onChange={(e) => setDoctorFollowupOption(e.target.checked)} />自动安排 7 天后的随访（默认不勾选）</label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={cancelDoctorSyncWindow} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300">取消</button>
                <button type="button" onClick={executeDoctorSync} className="rounded-[var(--radius-control)] bg-[var(--alert)] px-3 py-1.5 text-xs text-white">立即执行</button>
              </div>
            </div>
          ) : null}
          {doctorVisibleNotice ? <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">{doctorVisibleNotice}</div> : null}
        </div>
      </details>

      {/* 添加患者 */}
      {addOpen ? (
        <div className="overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setAddOpen(false)}>
          <div className="modal-in w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-card)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-[var(--text-primary)]">添加患者</div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400">姓名</label>
                <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" placeholder="如：林婉" />
              </div>
              <div>
                <label className="text-xs text-slate-400">孕周（如 30+2）</label>
                <input value={draft.week} onChange={(e) => setDraft((d) => ({ ...d, week: e.target.value }))} className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" placeholder="30+2" />
              </div>
              <div>
                <label className="text-xs text-slate-400">高危因素（可多选）</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {RISK_FACTOR_CHOICES.map((f) => (
                    <button key={f} type="button" onClick={() => toggleDraftFactor(f)} className={`rounded-full border px-2.5 py-1 text-xs transition ${draft.riskFactors.includes(f) ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-slate-400'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">初始风险等级</label>
                <div className="mt-2 flex gap-1.5">
                  {(['safe', 'attention', 'alert'] as const).map((lvl) => (
                    <button key={lvl} type="button" onClick={() => setDraft((d) => ({ ...d, level: lvl }))} className={`rounded-full border px-2.5 py-1 text-xs transition ${draft.level === lvl ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-white' : 'border-[var(--border-subtle)] text-slate-400'}`}>{LEVEL_BADGE[lvl].label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setAddOpen(false)} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] text-sm text-slate-200 transition hover:bg-[var(--bg-2)]">取消</button>
              <button type="button" disabled={!draft.name.trim()} onClick={submitNewPatient} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] bg-[var(--accent)] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40">添加</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
