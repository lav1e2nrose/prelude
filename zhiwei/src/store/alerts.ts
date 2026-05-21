import { create } from 'zustand'
import type { AlertEvent } from '../types/events'

interface AlertsStore {
  alerts: AlertEvent[]
  acknowledgeAlert: (alertId: string) => void
  addAlert: (alert: AlertEvent) => void
}

const initialAlerts: AlertEvent[] = [
  {
    id: 'alert-001',
    patientId: 'patient-001',
    level: 'attention',
    createdAt: Date.now() - 1000 * 60 * 18,
    summary: '宫缩频率上升，建议休息并持续监测',
    acknowledged: false
  },
  {
    id: 'alert-002',
    patientId: 'patient-001',
    level: 'alert',
    createdAt: Date.now() - 1000 * 60 * 5,
    summary: 'EHG 波形持续增强，请准备联系医生',
    acknowledged: false
  }
]

export const useAlertsStore = create<AlertsStore>((set) => ({
  alerts: initialAlerts,
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    })),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] }))
}))
