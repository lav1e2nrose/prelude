import type { Counterfactual } from '../../types/signal'

interface CounterfactualChartProps {
  scenarios?: Counterfactual[]
}

const fallbackScenarios: Counterfactual[] = [
  {
    scenario: '宫缩频率降至 2 次/h',
    conditionChanges: { contractionsPerHour: 2 },
    resultingRiskScore: 0.42,
    resultingRiskChange: -0.18,
    actionability: 'modifiable'
  },
  {
    scenario: '保持仰卧 + 电极质量下降',
    conditionChanges: { postureIndex: 3, electrodeQuality: 72 },
    resultingRiskScore: 0.71,
    resultingRiskChange: 0.12,
    actionability: 'fixed'
  }
]

export const CounterfactualChart = ({ scenarios = fallbackScenarios }: CounterfactualChartProps) => {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">反事实分析</div>
      <div className="mt-3 space-y-3">
        {scenarios.map((scenario) => {
          const riskPercent = Math.round(scenario.resultingRiskScore * 100)
          const delta = Math.round(scenario.resultingRiskChange * 100)
          return (
            <div key={scenario.scenario} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
              <div className="text-sm text-slate-200">{scenario.scenario}</div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span>预期风险 {riskPercent}%</span>
                <span className={delta >= 0 ? 'text-rose-300' : 'text-emerald-300'}>
                  {delta >= 0 ? `+${delta}` : delta}%
                </span>
                <span>可操作性：{scenario.actionability === 'modifiable' ? '可干预' : '不可干预'}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--bg-1)]">
                <div
                  className="h-full rounded-full bg-[var(--alert)]"
                  style={{ width: `${Math.min(100, riskPercent)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
