import type { RiskLevel } from '../../types/signal'

const levelStyles: Record<RiskLevel, string> = {
  safe: 'bg-[var(--safe)]',
  attention: 'bg-[var(--attention)]',
  alert: 'bg-[var(--alert)]',
  emergency: 'bg-[var(--critical)]'
}

interface StatusOrbProps {
  level: RiskLevel
  label: string
}

export const StatusOrb = ({ level, label }: StatusOrbProps) => {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-2">
      <span className={`h-3 w-3 rounded-full ${levelStyles[level]}`} />
      <span className="text-sm text-slate-200">{label}</span>
    </div>
  )
}
