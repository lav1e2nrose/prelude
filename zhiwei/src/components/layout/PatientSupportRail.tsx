import { useEffect, useState } from 'react'
import { getMockScenarioDefinition } from '../../data/mockScenarios'
import { useAppStore, usePatientJournalStore, useRealtimeStore } from '../../store'

const formatDuration = (seconds: number) => {
  const hour = Math.floor(seconds / 3600)
  const minute = Math.floor((seconds % 3600) / 60)
  if (hour > 0) return `${hour}h ${minute}m`
  return `${minute}m`
}

export const PatientSupportRail = () => {
  const [now, setNow] = useState(() => Date.now())
  const mockScenario = useAppStore((state) => state.mockScenario)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const activeMonitoringStartedAt = usePatientJournalStore((state) => state.activeMonitoringStartedAt)
  const monitorSessions = usePatientJournalStore((state) => state.monitorSessions)
  const contractions = usePatientJournalStore((state) => state.contractions)
  const fetalMovements = usePatientJournalStore((state) => state.fetalMovements)
  const timeline = usePatientJournalStore((state) => state.timeline)

  const scenario = getMockScenarioDefinition(mockScenario)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000 * 30)
    return () => window.clearInterval(timer)
  }, [])

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const dayStartMs = startOfDay.getTime()

  const todayContractions = contractions.filter((item) => item.timestamp >= dayStartMs)
  const todayMovements = fetalMovements.filter((item) => item.timestamp >= dayStartMs)
  const todayMonitorSeconds =
    monitorSessions
      .filter((item) => item.startedAt >= dayStartMs)
      .reduce((sum, item) => sum + item.durationSec, 0) +
    (activeMonitoringStartedAt ? Math.max(0, Math.round((now - activeMonitoringStartedAt) / 1000)) : 0)

  const batteryLabel = latestFrame ? `${Math.round(latestFrame.batteryLevel)}%` : scenario.battery
  const electrodeLabel = latestFrame ? `${Math.round(latestFrame.electrodeQuality)}%` : scenario.electrodeQuality
  const recentTimeline = timeline.slice(0, 8)

  return (
    <aside className="hidden h-full w-80 flex-col gap-4 border-l border-[var(--border-subtle)] bg-[var(--bg-1)]/80 p-4 xl:flex">
      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">设备状态</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>链路</span>
            <span className="font-medium text-[var(--text-primary)]">{connectionStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>电量</span>
            <span className="font-medium text-[var(--text-primary)]">{batteryLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>电极质量</span>
            <span className="font-medium text-[var(--text-primary)]">{electrodeLabel}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">今日统计</div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
            <span className="text-slate-400">监测时长</span>
            <span className="font-semibold text-[var(--text-primary)]">{formatDuration(todayMonitorSeconds)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
            <span className="text-slate-400">宫缩记录</span>
            <span className="font-semibold text-[var(--text-primary)]">{todayContractions.length} 次</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
            <span className="text-slate-400">胎动计数</span>
            <span className="font-semibold text-[var(--text-primary)]">{todayMovements.length} 次</span>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">今日时间线</div>
        <div className="mt-3 space-y-2 overflow-y-auto pr-1">
          {recentTimeline.map((item) => (
            <div key={item.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)]/80 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-slate-400">{item.title}</span>
              </div>
              <div className="mt-1 text-xs text-[var(--text-primary)]">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
