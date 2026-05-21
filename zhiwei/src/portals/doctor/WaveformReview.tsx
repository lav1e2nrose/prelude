import { CounterfactualChart } from '../../components/charts/CounterfactualChart'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'

export const WaveformReview = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <EHGWaveformChart />
      <CounterfactualChart />
    </div>
  )
}
