import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { ShapBarChart } from '../../components/charts/ShapBarChart'

export const ContractionHeatmapPage = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ContractionHeatmap />
      <ShapBarChart />
    </div>
  )
}
