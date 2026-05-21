import { useCollaborationStore } from '../../store/collaboration'

export const TeamManagement = () => {
  const guardians = useCollaborationStore((state) => state.guardians)

  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">团队管理</div>
      <div className="mt-4 space-y-3">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="flex items-center justify-between text-sm text-slate-200">
            <span>{guardian.name}</span>
            <span className="text-xs text-slate-400">{guardian.relationship}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
