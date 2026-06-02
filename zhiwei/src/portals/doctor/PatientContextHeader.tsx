import { LEVEL_BADGE } from '../../data/doctorPatients'
import { useDoctorStore } from '../../store/doctor'

// 医生端各页共用的"当前患者"上下文条：明确热图/波形/报告/审核针对的是哪一位患者，
// 并允许在不返回列表的情况下快速切换，避免"分不清是谁的数据"。
export const PatientContextHeader = () => {
  const patients = useDoctorStore((s) => s.patients)
  const selectedPatientId = useDoctorStore((s) => s.selectedPatientId)
  const setSelectedPatient = useDoctorStore((s) => s.setSelectedPatient)
  const patient = patients.find((p) => p.id === selectedPatientId) ?? null

  if (patients.length === 0) return null

  const badge = patient ? LEVEL_BADGE[patient.level] : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-500">当前患者</span>
        {patient ? (
          <>
            <span className="text-base font-semibold text-[var(--text-primary)]">{patient.name}</span>
            <span className="text-xs text-slate-400">{patient.id} · 孕 {patient.week} · 7d 风险 {patient.risk7d}%</span>
            {badge ? <span className={`rounded-full border px-2 py-0.5 text-[11px] ${badge.cls}`}>{badge.label}</span> : null}
          </>
        ) : (
          <span className="text-sm text-slate-400">未选择</span>
        )}
      </div>
      <select
        value={selectedPatientId ?? ''}
        onChange={(e) => setSelectedPatient(e.target.value)}
        className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
      >
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.name}（{p.id}）</option>
        ))}
      </select>
    </div>
  )
}
