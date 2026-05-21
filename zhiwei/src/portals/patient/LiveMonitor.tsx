import { BreathingCircle } from '../../components/charts/BreathingCircle'
import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'

export const LiveMonitor = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <EHGWaveformChart />
        <ContractionHeatmap />
      </div>
      <BreathingCircle />
    </div>
  )
}
