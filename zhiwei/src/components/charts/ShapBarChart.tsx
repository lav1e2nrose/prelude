import type { FeatureContribution } from '../../types/signal'

interface ShapBarChartProps {
  contributions?: FeatureContribution[]
}

const defaultContributions: FeatureContribution[] = [
  {
    featureName: 'contractionsPerHour',
    displayName: '宫缩频率',
    currentValue: 3.2,
    baselineValue: 1.6,
    contribution: 0.24,
    unit: '次/h'
  },
  {
    featureName: 'maternalHeartRate',
    displayName: '母体心率',
    currentValue: 92,
    baselineValue: 78,
    contribution: 0.1,
    unit: 'bpm'
  },
  {
    featureName: 'bandpowerHigh',
    displayName: '高频带功率',
    currentValue: 0.68,
    baselineValue: 0.44,
    contribution: 0.16,
    unit: 'a.u.'
  },
  {
    featureName: 'fetalMovementCount6h',
    displayName: '近 6 小时胎动',
    currentValue: 11,
    baselineValue: 14,
    contribution: -0.12,
    unit: '次'
  }
]

export const ShapBarChart = ({ contributions = defaultContributions }: ShapBarChartProps) => {
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
