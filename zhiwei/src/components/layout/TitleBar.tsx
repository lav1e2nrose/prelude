import { type CSSProperties, useEffect, useState } from 'react'
import { PortalSwitcher } from './PortalSwitcher'

export const TitleBar = () => {
  const desktop = window.zhiwei?.desktop
  const [maximized, setMaximized] = useState(false)
  const dragRegion: CSSProperties = { WebkitAppRegion: 'drag' }
  const noDragRegion: CSSProperties = { WebkitAppRegion: 'no-drag' }

  useEffect(() => {
    if (!desktop?.onWindowStateChange) return
    return desktop.onWindowStateChange(({ maximized: isMaximized }) => {
      setMaximized(isMaximized)
    })
  }, [desktop])

  return (
    <header
      className="flex items-center justify-between border-b border-white/10 bg-[var(--bg-1)] px-4 py-3"
      style={dragRegion}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-sm font-bold text-[var(--accent)]">
          知
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="text-base font-semibold text-white">早产风险监测控制台</div>
        </div>
      </div>
      <div className="flex items-center gap-3" style={noDragRegion}>
        <PortalSwitcher />
        {desktop?.isDesktop ? (
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[var(--bg-2)] p-1">
            <button
              type="button"
              aria-label="最小化窗口"
              onClick={() => desktop.minimize()}
              className="h-7 w-8 rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              —
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
