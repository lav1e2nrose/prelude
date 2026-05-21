import { useAppStore } from '../../store'

const portals = [
  { id: 'patient', label: '孕妇端' },
  { id: 'guardian', label: '家属端' },
  { id: 'doctor', label: '医生端' }
] as const

export const PortalSwitcher = () => {
  const portal = useAppStore((state) => state.portal)
  const setPortal = useAppStore((state) => state.setPortal)

  return (
    <div className="flex items-center gap-2 rounded-full bg-[var(--bg-2)] p-1">
      {portals.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setPortal(item.id)}
          className={`rounded-full px-4 py-1 text-sm transition ${
            portal === item.id ? 'bg-[var(--accent)] text-white' : 'text-slate-300'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
