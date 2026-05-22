const waveformSeries = [
  { id: 'ch1', color: 'var(--ehg-ch1)', values: [0.1, 0.24, 0.18, 0.3, 0.22, 0.4, 0.28, 0.36, 0.26, 0.2] },
  { id: 'ch2', color: 'var(--ehg-ch2)', values: [0.18, 0.2, 0.12, 0.26, 0.34, 0.28, 0.32, 0.24, 0.3, 0.22] },
  { id: 'ch3', color: 'var(--ehg-ch3)', values: [0.12, 0.18, 0.26, 0.2, 0.3, 0.34, 0.22, 0.28, 0.24, 0.2] },
  { id: 'ch4', color: 'var(--ehg-ch4)', values: [0.2, 0.14, 0.22, 0.3, 0.26, 0.18, 0.32, 0.28, 0.24, 0.16] }
]

const toPoints = (values: number[], width: number, height: number) => {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(0.01, max - min)
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export const EHGWaveformChart = () => {
  const width = 360
  const height = 140
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">EHG 实时波形</div>
        <div className="text-xs text-slate-400">最近 60 秒</div>
      </div>
      <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
          {waveformSeries.map((series) => (
            <polyline
              key={series.id}
              fill="none"
              stroke={series.color}
              strokeWidth="2"
              points={toPoints(series.values, width, height)}
              opacity="0.9"
            />
          ))}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div>采样率：250 Hz</div>
        <div>滤波：0.1-3 Hz</div>
      </div>
    </section>
  )
}
