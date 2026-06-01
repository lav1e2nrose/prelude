import type { ProcessedFrame } from '../../types/signal'

const toPath = (values: number[], width: number, height: number, globalMin: number, globalRange: number) => {
  if (values.length === 0) return ''
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width
      const y = height - ((value - globalMin) / globalRange) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

interface EHGWaveformChartProps {
  frames?: ProcessedFrame[]
}

const channels = ['ch1', 'ch2', 'ch3', 'ch4'] as const
const channelColors: Record<(typeof channels)[number], string> = {
  ch1: 'var(--ehg-ch1)',
  ch2: 'var(--ehg-ch2)',
  ch3: 'var(--ehg-ch3)',
  ch4: 'var(--ehg-ch4)'
}

export const EHGWaveformChart = ({ frames = [] }: EHGWaveformChartProps) => {
  const width = 360
  const channelHeight = 30
  const gap = 6
  const signalFrames = frames.slice(-150)
  const hasData = signalFrames.length > 1
  const latest = signalFrames.at(-1)
  const sampleRate = latest?.sampleRateHz ?? 20

  // 每通道独立归一化到自己的小窗，叠放显示
  const series = channels.map((channel, index) => {
    const values = signalFrames.map((frame) => frame.ehg[index] ?? frame.ehg[0] ?? 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = Math.max(0.01, max - min)
    return { id: channel, color: channelColors[channel], path: toPath(values, width, channelHeight, min, range) }
  })

  const totalHeight = channels.length * (channelHeight + gap)

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">EHG 实时波形（四导联）</div>
        {hasData ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-300">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: 'orb-pulse 1.6s ease-in-out infinite', ['--orb-glow' as string]: 'var(--safe-glow)' }} />
            实时流更新中 · {sampleRate}Hz
          </div>
        ) : (
          <div className="text-xs text-slate-500">未在监测</div>
        )}
      </div>
      <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3">
        {hasData ? (
          <svg viewBox={`0 0 ${width} ${totalHeight}`} className="h-40 w-full" preserveAspectRatio="none">
            {series.map((s, i) => (
              <g key={s.id} transform={`translate(0, ${i * (channelHeight + gap)})`}>
                <text x={2} y={10} fontSize={8} fill="var(--text-muted)">
                  {s.id.toUpperCase()}
                </text>
                <path d={s.path} fill="none" stroke={s.color} strokeWidth={1.4} strokeLinejoin="round" />
              </g>
            ))}
          </svg>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <div className="text-sm text-slate-400">连接设备后显示四导联实时波形</div>
            <div className="text-xs text-slate-500">在「实时监测」页点击开始监测，或在设置中开启演示模式</div>
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-400">
        <div>采样率：{hasData ? `${sampleRate} Hz` : '--'}</div>
        <div>显示滤波：0.1–3 Hz</div>
        <div>窗口：最近 {Math.round(signalFrames.length / Math.max(1, sampleRate))} 秒</div>
      </div>
    </section>
  )
}
