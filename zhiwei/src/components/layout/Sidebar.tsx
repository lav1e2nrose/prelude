export interface SidebarItem {
  id: string
  label: string
  description?: string
}

interface SidebarProps {
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
}

export const Sidebar = ({ items, activeId, onSelect }: SidebarProps) => {
  return (
    <aside className="flex h-full w-60 flex-col gap-3 border-r border-white/10 bg-[var(--bg-2)] p-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`rounded-xl px-4 py-3 text-left transition ${
            activeId === item.id ? 'bg-[var(--accent-dim)] text-white' : 'text-slate-300'
          }`}
        >
          <div className="text-sm font-semibold">{item.label}</div>
          {item.description && <div className="mt-1 text-xs text-slate-400">{item.description}</div>}
        </button>
      ))}
    </aside>
  )
}
