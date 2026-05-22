import { useAlertsStore } from '../../store/alerts'
import { AlertToast } from '../../components/shared/AlertToast'

export const AlertHistory = () => {
  const alerts = useAlertsStore((state) => state.alerts)
  const acknowledgeAlert = useAlertsStore((state) => state.acknowledgeAlert)
  const pendingCount = alerts.filter((item) => !item.acknowledged).length

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">预警历史</div>
        <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{alerts.length} 条</div>
        <div className="mt-1 text-xs text-slate-400">待处理 {pendingCount} 条</div>
      </div>
      {alerts.map((alert) => (
        <div key={alert.id} className="space-y-2">
          <AlertToast alert={alert} />
          {!alert.acknowledged ? (
            <button
              type="button"
              onClick={() => acknowledgeAlert(alert.id)}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-[var(--bg-2)]"
            >
              标记为已确认
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
