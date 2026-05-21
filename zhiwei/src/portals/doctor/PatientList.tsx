import { ExplanationTrigger } from '../../components/shared/ExplanationTrigger'
import { StatusOrb } from '../../components/shared/StatusOrb'

const patients = [
  { id: 'P-001', name: '林婉', week: '26+4', level: 'attention' as const },
  { id: 'P-002', name: '小雅', week: '32+3', level: 'alert' as const },
  { id: 'P-003', name: '张宁', week: '35+1', level: 'safe' as const }
]

export const PatientList = () => {
  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient.id} className="flex items-center justify-between rounded-2xl bg-[var(--bg-1)] p-4">
          <div>
            <div className="text-sm text-slate-400">{patient.id}</div>
            <div className="text-lg font-semibold text-white">{patient.name}</div>
            <div className="text-xs text-slate-400">孕周 {patient.week}</div>
          </div>
          <div className="flex items-center gap-4">
            <StatusOrb level={patient.level} label="风险状态" />
            <ExplanationTrigger />
          </div>
        </div>
      ))}
    </div>
  )
}
