import { useState } from 'react'

const feedbackItems = [
  { id: 'fb-001', note: '连续误报，建议调低敏感度', status: '待处理', source: '孕妇端' },
  { id: 'fb-002', note: '夜间误报已覆盖', status: '已处理', source: '医生覆盖' },
  { id: 'fb-003', note: '体位变化引发误判，需要补充特征', status: '待处理', source: '家属端' }
]

export const AlgorithmFeedback = () => {
  const [items, setItems] = useState(feedbackItems)

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">算法反馈队列</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2 text-sm text-slate-200"
          >
            <div>
              <div className="text-sm text-[var(--text-primary)]">{item.note}</div>
              <div className="mt-1 text-xs text-slate-400">来源：{item.source}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{item.status}</span>
              {item.status !== '已处理' ? (
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, status: '已处理' } : entry
                      )
                    )
                  }
                  className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-2 py-1 text-xs text-slate-300"
                >
                  标记已处理
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
