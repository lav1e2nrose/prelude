import { useEffect, useState } from 'react'
import { useAppStore, useRealtimeStore } from '../../store'
import type { ConnectionStatus } from '../../data/IDataSource'
import type { UserRole } from '../../types/user'

const portalLabelMap: Record<UserRole, string> = {
  patient: '孕妇端',
  guardian: '家属端',
  doctor: '医生端'
}

// 连接徽章严格映射真实状态机，禁止默认"已连接"
const connectionMeta: Record<ConnectionStatus, { label: string; dot: string }> = {
  idle: { label: '未连接', dot: 'bg-slate-500' },
  scanning: { label: '扫描设备中', dot: 'bg-sky-400 animate-pulse' },
  pairing: { label: '连接中', dot: 'bg-sky-400 animate-pulse' },
  connected: { label: '已连接', dot: 'bg-emerald-400' },
  reconnecting: { label: '重连中', dot: 'bg-amber-400 animate-pulse' },
  error: { label: '连接异常', dot: 'bg-rose-400' },
  mock: { label: '模拟数据', dot: 'bg-violet-400' }
}

const riskEngineMeta: Record<'unavailable' | 'connecting' | 'ready', { label: string; cls: string }> = {
  unavailable: { label: '算法未接入', cls: 'border-slate-500/30 text-slate-400' },
  connecting: { label: '算法连接中', cls: 'border-sky-400/30 text-sky-300' },
  ready: { label: '算法就绪', cls: 'border-emerald-400/30 text-emerald-300' }
}

export const TitleBar = () => {
  const desktop = window.zhiwei?.desktop
  const [maximized, setMaximized] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const session = useAppStore((state) => state.session)
  const logout = useAppStore((state) => state.logout)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const riskEngineStatus = useRealtimeStore((state) => state.riskEngineStatus)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)

  const conn = connectionMeta[connectionStatus] ?? connectionMeta.idle
  const engine = riskEngineMeta[riskEngineStatus] ?? riskEngineMeta.unavailable
  const battery = latestFrame?.batteryLevel != null ? `${Math.round(latestFrame.batteryLevel)}%` : '--'
  const electrode = latestFrame?.electrodeQuality != null ? `${latestFrame.electrodeQuality}%` : '--'

  useEffect(() => {
    if (!desktop?.onWindowStateChange) return
    return desktop.onWindowStateChange(({ maximized: isMaximized }) => setMaximized(isMaximized))
  }, [desktop])

  useEffect(() => {
    let intervalId: number | null = null
    const alignToMinute = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), 1000 * 60)
    }, (60 - new Date().getSeconds()) * 1000)
    return () => {
      window.clearTimeout(alignToMinute)
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [])

  return (
    <header className="drag-region flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-1)]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-dim)] text-sm font-bold text-[var(--accent)]">
          知
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="text-base font-semibold text-[var(--text-primary)]">早产风险监测控制台</div>
        </div>
        {/* 连接徽章：设备状态 + 电量 + 电极质量 */}
        <div className="ml-2 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          <span className={`inline-flex h-2 w-2 rounded-full ${conn.dot}`} />
          {conn.label}
          {connectionStatus === 'connected' || connectionStatus === 'mock' ? (
            <span className="text-slate-500">· 电量 {battery} · 电极 {electrode}</span>
          ) : null}
        </div>
        {/* 算法服务徽章 */}
        <div className={`rounded-full border bg-[var(--bg-2)] px-3 py-1 text-xs ${engine.cls}`}>
          {engine.label}
        </div>
      </div>

      <div className="no-drag-region flex items-center gap-3">
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          {now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {session ? (
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
            <span className="font-medium text-[var(--text-primary)]">{session.displayName}</span>
            <span className="text-slate-500">· {portalLabelMap[session.role]}</span>
            <button
              type="button"
              onClick={logout}
              className="ml-1 rounded-md border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300"
            >
              退出登录
            </button>
          </div>
        ) : null}
        {desktop?.isDesktop ? (
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] p-1">
            <button type="button" aria-label="最小化窗口" onClick={() => desktop.minimize()} className="h-7 w-8 rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white">−</button>
            <button type="button" aria-label={maximized ? '还原窗口' : '最大化窗口'} onClick={() => desktop.toggleMaximize()} className="h-7 w-8 rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white">{maximized ? '❐' : '□'}</button>
            <button type="button" aria-label="关闭窗口" onClick={() => desktop.close()} className="h-7 w-8 rounded-md text-rose-300 transition hover:bg-rose-500/80 hover:text-white">×</button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
