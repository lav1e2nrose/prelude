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
    <aside className="flex h-full w-64 flex-col gap-1.5 border-r border-[var(--border-subtle)] bg-[var(--bg-2)]/92 p-4">
      <div className="mb-2 px-1 text-[11px] uppercase tracking-[0.28em] text-slate-500">功能导航</div>
      {items.map((item) => {
        const active = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`group relative overflow-hidden rounded-[var(--radius-control)] border px-4 py-3 text-left transition duration-200 ${
              active
                ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)] text-[var(--text-primary)] shadow-[0_8px_28px_rgba(0,0,0,0.22)]'
                : 'border-transparent text-slate-300 hover:translate-x-0.5 hover:border-[var(--border-subtle)] hover:bg-[var(--bg-1)]'
            }`}
          >
            {/* 激活指示条：从中心纵向展开 */}
            <span
              className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)] transition-opacity ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
              style={active ? { animation: 'indicator-grow 220ms cubic-bezier(0.18,0.89,0.32,1.1)' } : undefined}
            />
            <div className="text-sm font-semibold">{item.label}</div>
            {item.description && <div className="mt-1 text-xs text-slate-400">{item.description}</div>}
          </button>
        )
      })}
      <div className="mt-auto rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/80 px-3 py-3 text-xs leading-5 text-slate-400">
        所有紧急操作采用 3 秒倒计时，可随时取消。
      </div>
    </aside>
  )
}
