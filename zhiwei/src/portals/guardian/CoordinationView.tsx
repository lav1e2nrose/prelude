import { TeamSidebar } from './TeamSidebar'
import { useCollaborationStore } from '../../store/collaboration'

export const CoordinationView = () => {
  const coordination = useCollaborationStore((state) => state.coordination)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">协作响应状态</div>
        <div className="mt-4 text-sm text-slate-200">
          已确认：{coordination.acknowledgedGuardians.length} 人 · 在路上：{coordination.enRouteGuardians.length} 人
        </div>
        <div className="mt-2 text-xs text-slate-400">升级状态：{coordination.escalationStatus}</div>
      </div>
      <TeamSidebar />
    </div>
  )
}
