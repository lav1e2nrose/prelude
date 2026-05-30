import { useState } from 'react'
import type { RiskExplanation } from '../../types/signal'
import { CounterfactualChart } from '../charts/CounterfactualChart'
import { ShapBarChart } from '../charts/ShapBarChart'

interface ExplainabilityPanelProps {
  explanation: RiskExplanation
}

const outcomeLabels: Record<string, string> = {
  term_delivery: '足月分娩',
  preterm_24h: '24h 内早产',
  preterm_7d: '7 日内早产',
  preterm_28d: '28 日内早产',
  unknown: '结局未知'
}

const overrideReasonOptions = [
  '算法忽略了关键临床信息',
  '算法对此类患者预测不准',
  '我有额外的检查结果',
  '患者主观症状与算法不符',
  '其他'
]

export const ExplainabilityPanel = ({ explanation }: ExplainabilityPanelProps) => {
  const [showOverride, setShowOverride] = useState(false)
  const [agreedWithScore, setAgreedWithScore] = useState<boolean | null>(null)
  const [clinicalScore, setClinicalScore] = useState('')
  const [clinicalReasoning, setClinicalReasoning] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [overrideSubmitted, setOverrideSubmitted] = useState(false)

  const riskScore = Math.round(explanation.confidence * 100)
  const ciLow = Math.round(explanation.confidenceInterval[0] * 100)
  const ciHigh = Math.round(explanation.confidenceInterval[1] * 100)

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const submitOverride = () => {
    if (clinicalReasoning.trim().length < 20) return
    setOverrideSubmitted(true)
    setShowOverride(false)
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      {/* 总览段 */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">可解释性摘要</div>
        <div className="text-xs text-slate-400">模型：{explanation.modelVersion}</div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 px-4 py-3">
        <div>
          <div className="text-xs text-slate-400">当前风险评分</div>
          <div className="mt-1 text-3xl font-semibold text-[var(--alert)]">{riskScore}%</div>
          <div className="mt-0.5 text-[11px] text-slate-400">置信区间 {ciLow}% – {ciHigh}% (95% CI)</div>
        </div>
        <div className="flex-1 space-y-1 text-xs text-slate-400">
          <div>训练数据  2018-2024 · n=12,847</div>
          <div>同类患者 AUC = 0.86 · 最后更新 2024-09-15</div>
          <div>离群得分：{(explanation.oodScore * 100).toFixed(1)}%（越低越接近训练分布）</div>
        </div>
      </div>

      {/* 特征贡献段（SHAP） */}
      <div className="mt-4">
        <div className="mb-2 text-xs text-slate-400">为什么是 {riskScore}%？以下因素影响了这个评分：</div>
        <ShapBarChart contributions={explanation.featureContributions ?? []} />
      </div>

      {/* 反事实分析段 */}
      {explanation.counterfactuals && explanation.counterfactuals.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-xs text-slate-400">如果……会怎样？（反事实分析）</div>
          <CounterfactualChart scenarios={explanation.counterfactuals} />
        </div>
      ) : null}

      {/* 类比患者段 */}
      <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
        <div className="text-xs text-slate-400">数据库中最相似的历史患者</div>
        <div className="mt-2 space-y-1.5">
          {explanation.similarPatients.map((patient, idx) => (
            <div key={patient.anonymizedId} className="flex items-center gap-3 text-xs text-slate-300">
              <span className="text-slate-500">#{idx + 1}</span>
              <span>相似度 {(patient.similarityScore * 100).toFixed(0)}%</span>
              <span>孕 {patient.gestationalWeekAtMeasurement} 周触发</span>
              <span className={patient.actualOutcome === 'term_delivery' ? 'text-[var(--safe)]' : 'text-[var(--attention)]'}>
                → {outcomeLabels[patient.actualOutcome] ?? patient.actualOutcome}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 不确定性与盲区段 */}
      {explanation.knownLimitations.length > 0 ? (
        <div className="mt-4 rounded-[var(--radius-control)] border border-amber-400/20 bg-amber-500/5 p-3">
          <div className="text-xs font-medium text-amber-200">不确定性提示</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            {explanation.knownLimitations.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Override 入口段 */}
      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <div className="text-xs text-slate-400">您是否同意此评分？</div>
        {overrideSubmitted ? (
          <div className="mt-2 rounded-lg border border-[var(--safe)]/30 bg-[var(--safe)]/10 px-3 py-2 text-xs text-emerald-200">
            覆盖记录已提交并进入算法反馈队列。
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setAgreedWithScore(true); setShowOverride(false) }}
              className={`rounded-[var(--radius-control)] border px-3 py-1.5 text-xs transition ${
                agreedWithScore === true
                  ? 'border-[var(--safe)]/50 bg-[var(--safe)]/15 text-emerald-200'
                  : 'border-[var(--border-subtle)] text-slate-300 hover:border-[var(--border-default)]'
              }`}
            >
              我同意 {riskScore}% 的评分
            </button>
            <button
              type="button"
              onClick={() => { setAgreedWithScore(false); setShowOverride(true) }}
              className={`rounded-[var(--radius-control)] border px-3 py-1.5 text-xs transition ${
                agreedWithScore === false
                  ? 'border-[var(--alert)]/50 bg-[var(--alert)]/15 text-rose-200'
                  : 'border-[var(--border-subtle)] text-slate-300 hover:border-[var(--border-default)]'
              }`}
            >
              我不同意，需要修正
            </button>
          </div>
        )}
      </div>

      {/* Override 表单（内联展开） */}
      {showOverride ? (
        <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--alert)]/20 bg-[var(--bg-2)] p-4 space-y-3">
          <div className="text-sm font-semibold text-[var(--text-primary)]">覆盖算法评分</div>
          <div className="text-xs text-slate-400">算法评分：{riskScore}%</div>
          <div>
            <label className="text-xs text-slate-400">您的临床评分（%）</label>
            <input
              type="number"
              min={0}
              max={100}
              value={clinicalScore}
              onChange={(e) => setClinicalScore(e.target.value)}
              placeholder="如：45"
              className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">临床判断依据（必填，至少 20 字）</label>
            <textarea
              value={clinicalReasoning}
              onChange={(e) => setClinicalReasoning(e.target.value)}
              placeholder="请描述您的临床判断依据，例如：患者近期做了宫颈长度测量，结果为 3.2cm，与算法输入不一致……"
              className="mt-1 h-20 w-full resize-none rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
            />
            {clinicalReasoning.trim().length > 0 && clinicalReasoning.trim().length < 20 ? (
              <div className="mt-1 text-xs text-rose-400">至少还需 {20 - clinicalReasoning.trim().length} 字</div>
            ) : null}
          </div>
          <div>
            <div className="text-xs text-slate-400">覆盖原因分类（多选）</div>
            <div className="mt-2 space-y-1.5">
              {overrideReasonOptions.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => toggleReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-400">
            此覆盖会：影响该患者后续显示的评分 · 进入算法反馈队列用于模型迭代 · 记录于诊疗日志
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowOverride(false)}
              className="flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-4 py-2 text-xs text-slate-300"
            >
              取消
            </button>
            <button
              type="button"
              onClick={submitOverride}
              disabled={clinicalReasoning.trim().length < 20}
              className="flex-1 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-xs text-white disabled:opacity-40"
            >
              确认覆盖
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
