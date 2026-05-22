import { useAppStore } from '../../store'

const portals = [
  { id: 'patient', label: '孕妇端', icon: '👩' },
  { id: 'guardian', label: '家属端', icon: '👨' },
  { id: 'doctor', label: '医生端', icon: '⚕' }
] as const

export const PortalSwitcher = () => {
  const portal = useAppStore((state) => state.portal)
  const setPortal = useAppStore((state) => state.setPortal)

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)]/90 p-1">
      {portals.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setPortal(item.id)}
          className={`rounded-full px-4 py-1 text-sm transition ${
            portal === item.id
              ? 'bg-[var(--accent)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
              : 'text-slate-300 hover:bg-white/5 hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="mr-1.5">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}
