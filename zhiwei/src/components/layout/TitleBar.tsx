import { PortalSwitcher } from './PortalSwitcher'

export const TitleBar = () => {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[var(--bg-1)] px-6 py-3">
      <div>
        <div className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">知微</div>
        <div className="text-lg font-semibold text-white">早产风险监测控制台</div>
      </div>
      <PortalSwitcher />
    </header>
  )
}
