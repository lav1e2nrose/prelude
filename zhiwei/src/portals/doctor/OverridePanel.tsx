import { useMemo, useState } from 'react'
import { ExplainabilityPanel } from '../../components/shared/ExplainabilityPanel'
import { ExplainabilityEngine } from '../../data/ExplainabilityEngine'
import type { EHGFrame } from '../../types/signal'

const engine = new ExplainabilityEngine()

const demoFrame: EHGFrame = {
  timestamp: Date.now(),
  ehg: [0.06, 0.09, 0.05, 0.08, 0.04, 0.03],
  maternalHR: 96,
  imu: { ax: 0.2, ay: 0.3, az: 0.7, gx: 0.02, gy: 0.01, gz: 0.03 },
  electrodeQuality: 83,
  batteryLevel: 79,
  posture: 'lying_left'
}

const overrideHistory = [
  { id: 'ov-001', timeLabel: '11-12 14:35', patient: '张小雅', algorithmScore: 78, clinicalScore: 45, reason: '患者近期宫颈长度测量 3.2cm，与算法输入不一致。体位变化导致瞬时波形增幅，临床判断不构成真实高危。', categories: ['算法忽略了关键临床信息', '我有额外的检查结果'] },
  { id: 'ov-002', timeLabel: '11-13 09:11', patient: '李女士', algorithmScore: 92, clinicalScore: 70, reason: '双胎减胎术后患者，算法训练集中双胎样本占比仅 3.2%，对此类患者预测可信度偏低。结合床旁评估，风险未达到紧急处置门槛。', categories: ['算法对此类患者预测不准'] }
]

export const OverridePanel = () => {
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null)
  const explanation = useMemo(() => engine.generateExplanation(demoFrame), [])

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">医生覆盖流程</div>
        <div className="mt-2 text-xs text-slate-400 leading-6">
          在患者列表或波形回放页中，点击任意风险评分旁的 ⓘ 图标 → 打开可解释性面板 → 滚动到底部 → 点击"我不同意，需要修正"即可进入完整覆盖流程。覆盖记录自动进入算法反馈队列。
        </div>
      </div>

      {/* 当前演示患者的可解释性面板（含覆盖入口） */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="mb-3 text-xs text-slate-400">演示患者：张小雅（P-002）· 当前评分 · 完整可解释性面板</div>
        <ExplainabilityPanel explanation={explanation} />
      </div>

      {/* 历史覆盖记录 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">本周覆盖记录（{overrideHistory.length} 条）</div>
        <div className="mt-4 space-y-3">
          {overrideHistory.map((record) => (
            <div key={record.id}>
              <button
                type="button"
                onClick={() => setSelectedHistory(selectedHistory === record.id ? null : record.id)}
                className={`w-full rounded-[var(--radius-card)] border px-4 py-3 text-left transition ${
                  selectedHistory === record.id
                    ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-2)]/70 hover:border-[var(--border-default)]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{record.patient}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{record.timeLabel}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">算法 {record.algorithmScore}%</span>
                    <span className="text-[var(--safe)]">→ 医生 {record.clinicalScore}%</span>
                    <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-0.5 text-sky-300">已覆盖</span>
                  </div>
                </div>
              </button>
              {selectedHistory === record.id ? (
                <div className="mt-1 rounded-b-[var(--radius-card)] border border-t-0 border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3 space-y-2 text-xs text-slate-300">
                  <div className="font-medium text-slate-200">临床判断依据</div>
                  <div className="leading-6 text-slate-400">{record.reason}</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {record.categories.map((c) => (
                      <span key={c} className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-slate-500">{c}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
