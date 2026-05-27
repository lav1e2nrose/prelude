import { useEffect, useState } from 'react'
import { useAppStore, useRealtimeStore } from '../../store'

export const TitleBar = () => {
  const desktop = window.zhiwei?.desktop
  const [maximized, setMaximized] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const portal = useAppStore((state) => state.portal)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const portalLabelMap = {
    patient: '孕妇端',
    guardian: '家属端',
    doctor: '医生端'
  }
  const portalLabel = portalLabelMap[portal] ?? '未知'
  const sourceLabel =
    dataSourceType === 'ble' ? '真实设备' : dataSourceType === 'websocket' ? '实时网关' : 'Mock 模式'
  const sourceDetail =
    dataSourceType === 'ble'
      ? latestFrame?.batteryLevel != null
        ? `电量 ${Math.round(latestFrame.batteryLevel)}%`
        : sourceConfig.ble.deviceId || '等待设备连接'
      : dataSourceType === 'websocket'
        ? sourceConfig.websocket.url
        : latestFrame?.batteryLevel != null
          ? `电量 ${Math.round(latestFrame.batteryLevel)}%`
          : '模拟数据运行中'

  useEffect(() => {
    if (!desktop?.onWindowStateChange) return
    return desktop.onWindowStateChange(({ maximized: isMaximized }) => {
      setMaximized(isMaximized)
    })
  }, [desktop])

  useEffect(() => {
    let intervalId: number | null = null
    const alignToMinute = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => {
        setNow(new Date())
      }, 1000 * 60)
    }, (60 - new Date().getSeconds()) * 1000)

    return () => {
      window.clearTimeout(alignToMinute)
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  return (
    <header
      className="drag-region flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-1)]/95 px-4 py-3 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-dim)] text-sm font-bold text-[var(--accent)]">
          知
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="text-base font-semibold text-[var(--text-primary)]">早产风险监测控制台</div>
        </div>
        <div className="ml-3 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
          独立窗口运行中
        </div>
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
          {sourceLabel}
        </div>
      </div>
      <div className="no-drag-region flex items-center gap-3">
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          {now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          模式：{portalLabel}
        </div>
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          链路：{connectionStatus}
        </div>
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          {sourceDetail}
        </div>
        {desktop?.isDesktop ? (
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] p-1">
            <button
              type="button"
              aria-label="最小化窗口"
              onClick={() => desktop.minimize()}
              className="h-7 w-8 rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              −
            </button>
            <button
              type="button"
              aria-label={maximized ? '还原窗口' : '最大化窗口'}
              onClick={() => desktop.toggleMaximize()}
              className="h-7 w-8 rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {maximized ? '❐' : '□'}
            </button>
            <button
              type="button"
              aria-label="关闭窗口"
              onClick={() => desktop.close()}
              className="h-7 w-8 rounded-md text-rose-300 transition hover:bg-rose-500/80 hover:text-white"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
