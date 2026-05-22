import { useCollaborationStore } from '../../store/collaboration'

export const TeamSidebar = () => {
  const guardians = useCollaborationStore((state) => state.guardians)

  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">协作成员</div>
      <div className="mt-4 space-y-3">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/60 p-3">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>{guardian.name}</span>
              <span className="text-xs text-slate-400">
                {guardian.currentStatus.isOnline ? '在线' : '离线'}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              最近活跃：{new Date(guardian.currentStatus.lastActiveAt).toLocaleTimeString('zh-CN')}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
