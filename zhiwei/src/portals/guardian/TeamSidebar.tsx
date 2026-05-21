import { useCollaborationStore } from '../../store/collaboration'

export const TeamSidebar = () => {
  const guardians = useCollaborationStore((state) => state.guardians)

  return (
    <aside className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">协作成员</div>
      <div className="mt-4 space-y-3">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="flex items-center justify-between text-sm text-slate-200">
            <span>{guardian.name}</span>
            <span className="text-xs text-slate-400">
              {guardian.currentStatus.isOnline ? '在线' : '离线'}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}
