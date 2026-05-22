import { useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplanationTrigger } from '../../components/shared/ExplanationTrigger'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import type { EHGFrame } from '../../types/signal'

const patients = [
  { id: 'P-001', name: '林婉', week: '26+4', level: 'attention' as const },
  { id: 'P-002', name: '小雅', week: '32+3', level: 'alert' as const },
  { id: 'P-003', name: '张宁', week: '35+1', level: 'safe' as const }
]

const explainabilityEngine = new ExplainabilityEngine()

export const PatientList = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id ?? null)
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null
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

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">患者总览</div>
        <div className="mt-2 text-xs text-slate-400">今日需重点关注 {patients.filter((p) => p.level !== 'safe').length} 人</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <div className="space-y-3">
          {patients.map((patient) => (
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
                <div className="text-xs text-slate-400">孕周 {patient.week}</div>
              </div>
              <div className="flex items-center gap-4">
                <StatusOrb level={patient.level} label="风险状态" />
                <ExplanationTrigger onClick={() => setSelectedPatientId(patient.id)} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {selectedPatient ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
              <div className="mb-2 text-sm text-slate-300">
                临床解释 · {selectedPatient.name}（{selectedPatient.id}）
              </div>
              {explanation ? <ExplainabilityPanel explanation={explanation} /> : null}
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
