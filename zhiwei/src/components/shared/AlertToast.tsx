import type { AlertEvent } from '../../types/events'

interface AlertToastProps {
  alert: AlertEvent
}

export const AlertToast = ({ alert }: AlertToastProps) => {
  const levelText: Record<typeof alert.level, string> = {
    safe: '稳定',
    attention: '关注',
    alert: '预警',
    emergency: '紧急'
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/90 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString('zh-CN')}</div>
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] px-2.5 py-1 text-[11px] text-slate-300">
          {levelText[alert.level]}
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{alert.summary}</div>
      <div className="mt-3 text-xs text-slate-400">{alert.acknowledged ? '状态：已确认' : '状态：待处理'}</div>
    </div>
  )
}
