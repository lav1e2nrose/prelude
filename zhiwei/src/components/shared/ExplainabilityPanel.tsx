import type { RiskExplanation } from '../../types/signal'

interface ExplainabilityPanelProps {
  explanation: RiskExplanation
}

export const ExplainabilityPanel = ({ explanation }: ExplainabilityPanelProps) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--bg-1)] p-4">
      <div className="text-sm font-semibold text-white">可解释性摘要</div>
      <div className="mt-2 text-xs text-slate-400">模型版本：{explanation.modelVersion}</div>
      <div className="mt-4 space-y-2">
        {explanation.featureContributions.map((feature) => (
          <div key={feature.featureName} className="flex items-center justify-between text-xs text-slate-300">
            <span>{feature.displayName}</span>
            <span>{feature.currentValue.toFixed(1)} {feature.unit}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
