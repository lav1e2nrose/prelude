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
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <EHGWaveformChart />
        <ExplainabilityPanel explanation={explanation} />
      </div>
      <CounterfactualChart />
    </div>
  )
}
