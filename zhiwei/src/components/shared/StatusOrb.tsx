import type { CSSProperties } from 'react'
import type { RiskLevel } from '../../types/signal'

export type OrbLevel = RiskLevel | 'unknown'

// 状态点：颜色与呼吸节奏映射真实风险等级（PART 10）。
// 'unknown' = 无实时数据 / 算法未接入，显示中性灰且不呼吸，绝不用彩色冒充读数。
const levelStyle: Record<OrbLevel, { color: string; glow: string; pulseSec: number | null; text: string }> = {
  safe: { color: 'var(--safe)', glow: 'var(--safe-glow)', pulseSec: 4, text: '平稳' },
  attention: { color: 'var(--attention)', glow: 'var(--attention-glow)', pulseSec: 3, text: '留意' },
  alert: { color: 'var(--alert)', glow: 'var(--alert-glow)', pulseSec: 2, text: '预警' },
  emergency: { color: 'var(--critical)', glow: 'rgba(178,58,72,0.4)', pulseSec: 1.4, text: '紧急' },
  unknown: { color: 'var(--text-muted)', glow: 'transparent', pulseSec: null, text: '无数据' }
}

interface StatusOrbProps {
  level: OrbLevel
  label: string
}

export const StatusOrb = ({ level, label }: StatusOrbProps) => {
  const style = levelStyle[level] ?? levelStyle.unknown
  const dotStyle: CSSProperties = {
    backgroundColor: style.color,
    ['--orb-glow' as string]: style.glow,
    animation: style.pulseSec ? `orb-pulse ${style.pulseSec}s ease-in-out infinite` : undefined
  }

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-2">
      <span className="h-3 w-3 rounded-full" style={dotStyle} />
      <span className="text-sm text-slate-200">{label}</span>
    </div>
  )
}
