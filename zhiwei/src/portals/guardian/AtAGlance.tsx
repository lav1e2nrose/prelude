import { StatusOrb } from '../../components/shared/StatusOrb'
import { useMemorialStore, useMemorialWorkflowStore } from '../../store'
import { useAlertsStore } from '../../store/alerts'
import { useCollaborationStore } from '../../store/collaboration'

export const AtAGlance = () => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const guardianVisibleNotice = useMemorialWorkflowStore((state) => state.guardianVisibleNotice)
  const remoteGuardianSuppressedCount = useMemorialWorkflowStore((state) => state.remoteGuardianSuppressedCount)
  const alerts = useAlertsStore((state) => state.alerts)
  const latestAlert = alerts[0]
  const pending = alerts.filter((alert) => !alert.acknowledged).length
  const guardians = useCollaborationStore((state) => state.guardians)
  const coordination = useCollaborationStore((state) => state.coordination)
  const primaryGuardian = guardians.find((guardian) => guardian.id === coordination.primaryResponder)

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-[var(--text-primary)]">家属概览</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">实时风险</div>
          <div className="mt-3">
            <StatusOrb level={latestAlert?.level ?? 'attention'} label={memorialEnabled ? '账户状态' : '孕妇状态'} />
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {memorialEnabled ? '当前不接收主动提醒。' : `待处理预警 ${pending} 条 · 最近更新 ${latestAlert ? '刚刚' : '暂无'}`}
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">协作响应</div>
          <div className="mt-3 text-sm text-slate-300">
            已确认 {coordination.acknowledgedGuardians.length} 人 · 在路上 {coordination.enRouteGuardians.length} 人
          </div>
          <div className="mt-2 text-xs text-slate-400">
            第一联系人：{primaryGuardian?.name ?? '未指派'}
          </div>
          <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2 text-xs text-slate-300">
            升级状态：{coordination.escalationStatus}
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">设备状态</div>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>设备电量</span>
              <span>81%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>电极质量</span>
              <span>92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>最近同步</span>
              <span>30 秒前</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">近期提醒</div>
        <div className="mt-3 text-sm text-slate-300">
          {memorialEnabled ? '静默模式下已停止主动提醒。' : '今日 18:00 需提醒患者完成呼吸训练，并确认晚间状态已发送给医生。'}
        </div>
        {guardianVisibleNotice ? <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">{guardianVisibleNotice}</div> : null}
        {remoteGuardianSuppressedCount > 0 ? (
          <div className="mt-2 text-xs text-slate-500">异地家属 {remoteGuardianSuppressedCount} 人按信息隔离协议未收到主动通知。</div>
        ) : null}
      </div>
    </div>
  )
}
