import { useEffect, useState } from 'react'
import { PortalSwitcher } from './PortalSwitcher'

export const TitleBar = () => {
  const desktop = window.zhiwei?.desktop
  const [maximized, setMaximized] = useState(false)
  const [now, setNow] = useState(() => new Date())

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
      className="drag-region flex items-center justify-between border-b border-white/10 bg-[var(--bg-1)]/95 px-4 py-3 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-sm font-bold text-[var(--accent)]">
          知
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="text-base font-semibold text-white">早产风险监测控制台</div>
        </div>
        <div className="ml-3 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
          独立窗口运行中
        </div>
      </div>
      <div className="no-drag-region flex items-center gap-3">
        <div className="rounded-full border border-white/10 bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
          {now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <PortalSwitcher />
        {desktop?.isDesktop ? (
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[var(--bg-2)] p-1">
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
