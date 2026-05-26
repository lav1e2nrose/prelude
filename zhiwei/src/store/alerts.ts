import { create } from 'zustand'
import type { AlertEvent } from '../types/events'
import { useMemorialStore } from './memorial'

interface AlertsStore {
  alerts: AlertEvent[]
  acknowledgeAlert: (alertId: string) => void
  addAlert: (alert: AlertEvent) => void
  createDemoAlert: (level: AlertEvent['level']) => void
  markFalsePositive: (alertId: string) => void
  suppressAllAlerts: () => void
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
  addAlert: (alert) =>
    set((state) => {
      if (useMemorialStore.getState().memorial.enabled) {
        return state
      }
      return { alerts: [alert, ...state.alerts] }
    }),
  createDemoAlert: (level) =>
    set((state) => {
      if (useMemorialStore.getState().memorial.enabled) {
        return state
      }
      const summaryByLevel: Record<AlertEvent['level'], string> = {
        safe: '监测稳定，建议继续按计划观察',
        attention: '宫缩频率上升，请先卧床休息并观察 30 分钟',
        alert: '持续风险信号增强，建议通知家属并联系医生',
        emergency: '高危预警，请立即启动紧急响应流程'
      }
      const now = Date.now()
      const nextAlert: AlertEvent = {
        id: `alert-${now}`,
        patientId: 'patient-001',
        level,
        createdAt: now,
        summary: summaryByLevel[level],
        acknowledged: false
      }
      return { alerts: [nextAlert, ...state.alerts] }
    }),
  markFalsePositive: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              summary: `【已反馈误报】${alert.summary}`
            }
          : alert
      )
    })),
  suppressAllAlerts: () => set(() => ({ alerts: [] }))
}))
