import { useAlertsStore } from '../../store/alerts'
import { AlertToast } from '../../components/shared/AlertToast'

export const AlertHistory = () => {
  const alerts = useAlertsStore((state) => state.alerts)

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertToast key={alert.id} alert={alert} />
      ))}
    </div>
  )
}
