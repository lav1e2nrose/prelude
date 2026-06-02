import { useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import { useDoctorStore } from '../../store/doctor'
import { useRealtimeStore } from '../../store'
import { toast } from '../../store/toast'
import type { EHGFrame } from '../../types/signal'
import { PatientContextHeader } from './PatientContextHeader'

const engine = new ExplainabilityEngine()

export const WaveformReview = () => {
  const patient = useDoctorStore((s) => s.patients.find((p) => p.id === s.selectedPatientId) ?? null)
  const frameBuffer = useRealtimeStore((s) => s.frameBuffer)
  const [note, setNote] = useState('')

  const explanation = useMemo(() => {
    if (!patient) return null
    const frame: EHGFrame = {
      timestamp: 0,
      ehg: [0.02, 0.04, 0.01, 0.06],
      maternalHR: patient.level === 'alert' ? 96 : 84,
      imu: { ax: 0.2, ay: 0.3, az: 0.7, gx: 0.02, gy: 0.01, gz: 0.03 },
      electrodeQuality: 86,
      batteryLevel: 78,
      posture: 'lying_left'
    }
    return engine.generateExplanation(frame, { riskScore: patient.risk7d, riskFactors: patient.riskFactors })
  }, [patient])

  if (!patient) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-8 text-center text-sm text-slate-400">
        请先在「患者列表」中选择一位患者。
      </div>
    )
  }

  // 仅受监测患者（P-002 张小雅）有实时波形缓冲；其余患者暂无实时流
  const liveFrames = patient.id === 'P-002' ? frameBuffer : []

  return (
    <div className="space-y-4">
      <PatientContextHeader />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <EHGWaveformChart frames={liveFrames} />
          {explanation ? <ExplainabilityPanel explanation={explanation} /> : null}
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">波形复核标注 · {patient.name}</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="标注噪声区段、体位变化或临床判断依据…"
            className="mt-3 h-28 w-full resize-none rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => {
              if (note.trim()) {
                toast.success('已保存复核备注', `已记录到 ${patient.name} 的病历`)
                setNote('')
              }
            }}
            className="mt-3 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-xs text-white"
          >
            保存复核备注
          </button>
        </div>
      </div>
    </div>
  )
}
