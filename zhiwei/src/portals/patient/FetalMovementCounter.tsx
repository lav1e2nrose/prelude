import { useState } from 'react'

export const FetalMovementCounter = () => {
  const [count, setCount] = useState(12)
  const goal = 10
  const progress = Math.min(100, Math.round((count / goal) * 100))

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">胎动计数</div>
      <div className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">{count} 次</div>
      <div className="mt-2 text-xs text-slate-400">过去 2 小时内记录 · 目标 {goal} 次</div>
      <div className="mt-3 h-2 rounded-full bg-[var(--bg-2)]">
        <div className="h-full rounded-full bg-[var(--safe)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setCount((prev) => prev + 1)}
          className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1.5 text-xs text-white"
        >
          记录一次胎动
        </button>
        <button
          type="button"
          onClick={() => setCount((prev) => Math.max(0, prev - 1))}
          className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300"
        >
          撤销
        </button>
      </div>
    </div>
  )
}
