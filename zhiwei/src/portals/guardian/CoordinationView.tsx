import { TeamSidebar } from './TeamSidebar'
import { useCollaborationStore } from '../../store/collaboration'
import { CountdownCallButton } from '../../components/shared/CountdownCallButton'

export const CoordinationView = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const coordination = useCollaborationStore((state) => state.coordination)
  const acknowledgeByGuardian = useCollaborationStore((state) => state.acknowledgeByGuardian)
  const setGuardianEnRoute = useCollaborationStore((state) => state.setGuardianEnRoute)
  const markCannotRespond = useCollaborationStore((state) => state.markCannotRespond)
  const escalate = useCollaborationStore((state) => state.escalate)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">协作响应状态</div>
          <div className="mt-4 text-sm text-slate-200">
            已确认：{coordination.acknowledgedGuardians.length} 人 · 在路上：{coordination.enRouteGuardians.length} 人
          </div>
          <div className="mt-2 text-xs text-slate-400">升级状态：{coordination.escalationStatus}</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => escalate('escalated_to_all', '5 分钟内未完成集合，升级为全员通知')}
              className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100"
            >
              升级到全员
            </button>
            <button
              type="button"
              onClick={() => escalate('escalated_to_doctor', '患者主诉腹压增强，升级医生值班线')}
              className="rounded-lg border border-white/10 bg-[var(--bg-2)] px-3 py-1.5 text-xs text-slate-200"
            >
              升级到医生
            </button>
            <CountdownCallButton
              label="升级到 120"
              onConfirm={() => escalate('escalated_to_120', '触发倒计时后自动升级至急救电话')}
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">成员响应操作</div>
          <div className="mt-3 space-y-3">
            {guardians.map((guardian) => (
              <div key={guardian.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white">{guardian.name}</div>
                  <div className="text-xs text-slate-400">{guardian.relationship}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => acknowledgeByGuardian(guardian.id)}
                    className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-200"
                  >
                    已确认
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuardianEnRoute(guardian.id)}
                    className="rounded-md border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-100"
                  >
                    在路上
                  </button>
                  <button
                    type="button"
                    onClick={() => markCannotRespond(guardian.id)}
                    className="rounded-md border border-rose-300/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-100"
                  >
                    无法响应
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">升级时间线</div>
          <div className="mt-4 space-y-3">
            {coordination.escalationTimeline.map((item) => (
              <div key={`${item.level}-${item.timestamp}`} className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <div>
                  <div className="text-sm text-white">{item.reason}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString('zh-CN')} · {item.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TeamSidebar />
    </div>
  )
}
