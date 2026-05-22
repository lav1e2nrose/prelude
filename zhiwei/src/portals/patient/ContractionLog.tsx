import { useMemo, useState } from 'react'

const initialLogs = [
  { time: '08:42', duration: 42, intensity: '中等' },
  { time: '10:15', duration: 55, intensity: '偏强' },
  { time: '12:03', duration: 38, intensity: '轻度' }
]

export const ContractionLog = () => {
  const [logs, setLogs] = useState(initialLogs)
  const summary = useMemo(() => {
    if (logs.length === 0) return { average: 0, longest: 0 }
    const durations = logs.map((log) => log.duration)
    const average = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    const longest = Math.max(...durations)
    return { average, longest }
  }, [logs])

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">今日宫缩记录</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">记录次数</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{logs.length}</div>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">平均时长</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{summary.average}s</div>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">最长时长</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{summary.longest}s</div>
          </div>
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">最新记录</div>
          <button
            type="button"
            onClick={() => {
              const now = new Date()
              const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
              const duration = Math.floor(30 + Math.random() * 40)
              const intensity = duration > 50 ? '偏强' : duration > 40 ? '中等' : '轻度'
              setLogs((prev) => [{ time, duration, intensity }, ...prev])
            }}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-xs text-slate-300"
          >
            手动记录
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {logs.map((log) => (
            <div
              key={log.time}
              className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2 text-sm text-slate-200"
            >
              <span>{log.time}</span>
              <span>{log.duration}s</span>
              <span>{log.intensity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
