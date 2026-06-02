import type { CSSProperties } from 'react'
import type { OrbLevel } from '../shared/StatusOrb'

// 首页主视觉：大号风险环形仪表。颜色与呼吸节奏随风险等级变化（PART 10）。
// 有算法评分时显示百分比弧；无数据/算法未接入时显示中性脉冲环，绝不用彩色冒充读数。

const levelStyle: Record<OrbLevel, { color: string; glow: string; pulseSec: number | null }> = {
  safe: { color: 'var(--safe)', glow: 'var(--safe-glow)', pulseSec: 4 },
  attention: { color: 'var(--attention)', glow: 'var(--attention-glow)', pulseSec: 3 },
  alert: { color: 'var(--alert)', glow: 'var(--alert-glow)', pulseSec: 2 },
  emergency: { color: 'var(--critical)', glow: 'rgba(178,58,72,0.45)', pulseSec: 1.4 },
  unknown: { color: 'var(--text-muted)', glow: 'transparent', pulseSec: null }
}

interface RiskGaugeProps {
  level: OrbLevel
  /** 0-100 风险分；null = 算法未接入/无数据 */
  score: number | null
  statusText: string
  subText?: string
  size?: number
}

export const RiskGauge = ({ level, score, statusText, subText, size = 240 }: RiskGaugeProps) => {
  const style = levelStyle[level] ?? levelStyle.unknown
  const stroke = 14
  const r = (size - stroke) / 2
  const cx = size / 2
  const circumference = 2 * Math.PI * r
  const pct = score != null ? Math.max(0, Math.min(100, score)) / 100 : 0
  const dash = circumference * pct

  const glowStyle: CSSProperties = {
    ['--orb-glow' as string]: style.glow,
    animation: style.pulseSec ? `orb-pulse ${style.pulseSec}s ease-in-out infinite` : undefined
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 呼吸光晕 */}
      <div
        className="absolute rounded-full"
        style={{ width: size * 0.86, height: size * 0.86, backgroundColor: style.glow, filter: 'blur(28px)', ...glowStyle }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
        {score != null ? (
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={style.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.25,0.1,0.25,1)' }}
          />
        ) : (
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={style.color} strokeWidth={stroke} strokeDasharray="4 10" opacity={0.5} />
        )}
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        {score != null ? (
          <>
            <div className="text-5xl font-semibold leading-none text-[var(--text-primary)]">{Math.round(score)}<span className="text-2xl">%</span></div>
            <div className="mt-2 text-sm font-medium" style={{ color: style.color }}>{statusText}</div>
          </>
        ) : (
          <div className="text-xl font-semibold" style={{ color: style.color }}>{statusText}</div>
        )}
        {subText ? <div className="mt-1 max-w-[80%] text-xs leading-5 text-slate-400">{subText}</div> : null}
      </div>
    </div>
  )
}
