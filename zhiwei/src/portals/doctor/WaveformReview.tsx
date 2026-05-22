import { useState } from 'react'
import { CounterfactualChart } from '../../components/charts/CounterfactualChart'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'
import type { EHGFrame } from '../../types/signal'

const explainabilityEngine = new ExplainabilityEngine()
const demoFrame: EHGFrame = {
  timestamp: Date.now(),
  ehg: [0.02, 0.04, 0.01, 0.06, 0.03, 0.02],
  maternalHR: 92,
  imu: {
    ax: 0.2,
    ay: 0.3,
    az: 0.7,
    gx: 0.02,
    gy: 0.01,
    gz: 0.03
  },
  electrodeQuality: 86,
  batteryLevel: 78,
  posture: 'lying_left'
}
const explanation = explainabilityEngine.generateExplanation(demoFrame)

export const WaveformReview = () => {
  const [note, setNote] = useState('')

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <EHGWaveformChart />
        <ExplainabilityPanel explanation={explanation} />
      </div>
      <div className="space-y-4">
        <CounterfactualChart scenarios={explanation.counterfactuals ?? []} />
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">波形复核标注</div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="标注噪声区段、体位变化或临床判断依据..."
            className="mt-3 h-28 w-full resize-none rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            className="mt-3 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-xs text-white"
          >
            保存复核备注
          </button>
        </div>
      </div>
    </div>
  )
}
