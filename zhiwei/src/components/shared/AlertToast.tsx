import type { AlertEvent } from '../../types/events'

interface AlertToastProps {
  alert: AlertEvent
}

export const AlertToast = ({ alert }: AlertToastProps) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--bg-2)] p-3">
      <div className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleTimeString()}</div>
      <div className="mt-1 text-sm font-semibold text-white">{alert.summary}</div>
      <div className="mt-2 text-xs text-slate-400">等级：{alert.level}</div>
    </div>
  )
}
