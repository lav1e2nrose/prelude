import type { RiskExplanation } from '../../types/signal'
import { ShapBarChart } from '../charts/ShapBarChart'

interface ExplainabilityPanelProps {
  explanation: RiskExplanation
}

export const ExplainabilityPanel = ({ explanation }: ExplainabilityPanelProps) => {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">可解释性摘要</div>
        <div className="text-xs text-slate-400">模型版本：{explanation.modelVersion}</div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-3">
          <div className="text-xs text-slate-400">置信度</div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {Math.round(explanation.confidence * 100)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            可信区间 {(explanation.confidenceInterval[0] * 100).toFixed(0)}%-
            {(explanation.confidenceInterval[1] * 100).toFixed(0)}%
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-3">
          <div className="text-xs text-slate-400">离群得分</div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {(explanation.oodScore * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">越低越接近训练样本</div>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-3">
          <div className="text-xs text-slate-400">相似病例</div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {explanation.similarPatients.length} 例
          </div>
          <div className="mt-1 text-[11px] text-slate-400">匿名聚合结果</div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ShapBarChart contributions={explanation.featureContributions} />
        <div className="space-y-3">
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
            <div className="text-xs text-slate-400">相似病例摘要</div>
            {explanation.similarPatients.map((patient) => (
              <div key={patient.anonymizedId} className="mt-2 text-xs text-slate-300">
                {patient.anonymizedId} · 相似度 {(patient.similarityScore * 100).toFixed(0)}% ·
                {patient.actualOutcome === 'preterm_7d' ? '7 日内早产' : '无不良结局'}
              </div>
            ))}
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
            <div className="text-xs text-slate-400">已知限制</div>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              {explanation.knownLimitations.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
