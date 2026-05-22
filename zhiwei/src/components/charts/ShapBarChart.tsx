import type { FeatureContribution } from '../../types/signal'

interface ShapBarChartProps {
  contributions: FeatureContribution[]
}

export const ShapBarChart = ({ contributions }: ShapBarChartProps) => {
  const maxValue = Math.max(
    ...contributions.map((item) => Math.abs(item.contribution)),
    0.2
  )

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">SHAP 特征贡献</div>
      <div className="mt-3 space-y-2">
        {contributions.map((item) => {
          const ratio = Math.min(1, Math.abs(item.contribution) / maxValue)
          const barWidth = `${Math.round(ratio * 100)}%`
          const isPositive = item.contribution >= 0
          return (
            <div key={item.featureName} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{item.displayName}</span>
                <span>
                  {item.currentValue.toFixed(1)} {item.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-2)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: barWidth,
                    backgroundColor: isPositive ? 'var(--shap-positive)' : 'var(--shap-negative)'
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
