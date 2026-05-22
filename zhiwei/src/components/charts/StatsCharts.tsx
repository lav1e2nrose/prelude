export const StatsCharts = () => {
  const trend = [38, 42, 47, 51, 49, 53, 46]

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">统计趋势</div>
        <div className="text-xs text-slate-400">7 天</div>
      </div>
      <div className="mt-3 flex items-end gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3">
        {trend.map((value, index) => (
          <div key={`trend-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-full bg-[var(--accent)]/60"
              style={{ height: `${value}%` }}
            />
            <div className="text-[10px] text-slate-400">{index + 1}日</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-slate-400">风险指数均值 48 · 宫缩密度波动</div>
    </section>
  )
}
