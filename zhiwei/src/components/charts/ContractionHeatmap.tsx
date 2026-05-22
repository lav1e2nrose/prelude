export const ContractionHeatmap = () => {
  const rows = 6
  const cols = 12
  const data = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const base = Math.sin((row + 1) * 0.6 + col * 0.3) * 0.5 + 0.5
      return Math.max(0, Math.min(1, base))
    })
  )

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">宫缩热力图</div>
        <div className="text-xs text-slate-400">过去 6 小时</div>
      </div>
      <div className="mt-3 grid gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-2">
        {data.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-12 gap-1">
            {row.map((value, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 rounded-md"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--alert) ${Math.round(
                    value * 100
                  )}%, var(--bg-2))`
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>低强度</span>
        <span>高强度</span>
      </div>
    </section>
  )
}
