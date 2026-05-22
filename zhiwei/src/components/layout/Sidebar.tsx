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
    <aside className="flex h-full w-64 flex-col gap-3 border-r border-[var(--border-subtle)] bg-[var(--bg-2)]/92 p-4">
      <div className="mb-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/80 px-3 py-2 text-xs text-slate-300">
        功能导航
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`rounded-[var(--radius-control)] border px-4 py-3 text-left transition ${
            activeId === item.id
              ? 'border-[var(--accent)]/60 bg-[var(--accent-dim)] text-[var(--text-primary)] shadow-[0_8px_28px_rgba(0,0,0,0.25)]'
              : 'border-transparent text-slate-300 hover:border-[var(--border-subtle)] hover:bg-[var(--bg-1)]'
          }`}
        >
          <div className="text-sm font-semibold">{item.label}</div>
          {item.description && <div className="mt-1 text-xs text-slate-400">{item.description}</div>}
        </button>
      ))}
      <div className="mt-auto rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/80 px-3 py-3 text-xs text-slate-300">
        快捷提示：所有紧急操作采用 3 秒倒计时，可随时取消。
      </div>
    </aside>
  )
}
