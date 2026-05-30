import { TeamSidebar } from './TeamSidebar'
import { useCollaborationStore } from '../../store/collaboration'
import { useAlertsStore } from '../../store/alerts'
import { CountdownCallButton } from '../../components/shared/CountdownCallButton'

const relationshipLabels: Record<string, string> = {
  spouse: '丈夫',
  parent: '妈妈',
  parent_in_law: '公婆',
  sibling: '兄弟姐妹',
  caregiver: '月嫂',
  other: '其他'
}

export const CoordinationView = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const schedule = useCollaborationStore((state) => state.schedule)
  const coordination = useCollaborationStore((state) => state.coordination)
  const acknowledgeByGuardian = useCollaborationStore((state) => state.acknowledgeByGuardian)
  const setGuardianEnRoute = useCollaborationStore((state) => state.setGuardianEnRoute)
  const markCannotRespond = useCollaborationStore((state) => state.markCannotRespond)
  const escalate = useCollaborationStore((state) => state.escalate)
  const alerts = useAlertsStore((state) => state.alerts)
  const activeAlert = alerts.find((a) => !a.acknowledged)

  const formatShiftDays = (days: number[]) => {
    const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    if (days.length === 7) return '每天'
    if (JSON.stringify(days.sort()) === JSON.stringify([1, 2, 3, 4, 5])) return '工作日'
    return days.map((d) => labels[d]).join('/')
  }

  const getResponseStatus = (guardianId: string) => {
    if (coordination.enRouteGuardians.includes(guardianId)) return { label: '在路上', color: 'text-emerald-300' }
    if (coordination.acknowledgedGuardians.includes(guardianId)) return { label: '已确认', color: 'text-sky-300' }
    if (coordination.cannotRespondGuardians.includes(guardianId)) return { label: '无法响应', color: 'text-rose-300' }
    return { label: '待响应', color: 'text-slate-400' }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {/* 今日在岗排班 */}
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">今天的在岗安排</div>
            <div className="flex gap-2 text-xs">
              <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-slate-400 hover:text-slate-200">
                调整本周值班
              </button>
              <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-slate-400 hover:text-slate-200">
                临时请假
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {schedule.shifts.map((shift) => {
              const guardian = guardians.find((g) => g.id === shift.guardianId)
              return (
                <div
                  key={`${shift.guardianId}-${shift.startTime}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-4 py-2.5"
                >
                  <div className="text-sm text-slate-300">
                    {shift.startTime} – {shift.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-primary)]">{guardian?.name ?? shift.guardianId}</span>
                    <span className="text-xs text-slate-500">{formatShiftDays(shift.daysOfWeek)}</span>
                  </div>
                  {shift.guardianId === 'guardian-chen' ? (
                    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] text-[var(--accent)]">我</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* 警报响应区（有活跃警报时显示） */}
        {activeAlert ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--alert)]/30 bg-[var(--alert)]/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-rose-200">
                  张小雅在 {new Date(activeAlert.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 触发预警
                </div>
                <div className="mt-1 text-xs text-slate-400">{activeAlert.summary} · 级别：{activeAlert.level}</div>
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-400">— 团队响应状态 —</div>
            <div className="mt-2 space-y-2">
              {guardians
                .filter((g) => coordination.notifiedGuardians.includes(g.id))
                .map((guardian) => {
                  const status = getResponseStatus(guardian.id)
                  return (
                    <div key={guardian.id} className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
                      <span className="text-sm text-slate-200">{guardian.name}</span>
                      <span className={`text-xs ${status.color}`}>{status.label}</span>
                    </div>
                  )
                })}
            </div>
            <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3">
              <div className="text-xs text-slate-400">请选择您的响应</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => acknowledgeByGuardian('guardian-chen')}
                  className="rounded-[var(--radius-control)] border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100"
                >
                  我来处理
                </button>
                <button
                  type="button"
                  onClick={() => setGuardianEnRoute('guardian-chen')}
                  className="rounded-[var(--radius-control)] border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-100"
                >
                  我正在赶过去
                </button>
                <button
                  type="button"
                  onClick={() => markCannotRespond('guardian-chen')}
                  className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1.5 text-xs text-slate-300"
                >
                  我现在去不了
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
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
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1.5 text-xs text-slate-200"
              >
                升级到医生
              </button>
              <CountdownCallButton
                label="升级到 120"
                onConfirm={() => escalate('escalated_to_120', '触发倒计时后自动升级至急救电话')}
              />
            </div>
          </div>
        ) : null}

        {/* 团队成员列表 */}
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">团队成员（{guardians.length} 人）</div>
            <div className="flex gap-2 text-xs">
              <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-slate-400 hover:text-slate-200">
                + 邀请家庭成员
              </button>
              <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-slate-400 hover:text-slate-200">
                调整通知策略
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {guardians.map((guardian) => (
              <div
                key={guardian.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/60 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${guardian.currentStatus.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <div>
                    <span className="text-sm text-slate-200">{guardian.name}</span>
                    <span className="ml-2 text-xs text-slate-500">{relationshipLabels[guardian.relationship] ?? guardian.relationship}</span>
                  </div>
                  {guardian.isPrimaryContact ? (
                    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] text-[var(--accent)]">第一通知人</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
                  {guardian.notificationConfig.receivesAttention ? <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5">关注</span> : null}
                  {guardian.notificationConfig.receivesAlert ? <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5">预警</span> : null}
                  {guardian.notificationConfig.receivesEmergency ? <span className="rounded-full border border-amber-400/20 bg-amber-500/5 px-1.5 py-0.5 text-amber-300">紧急</span> : null}
                  {guardian.permissions.viewWaveform ? <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5">看波形</span> : null}
                  {guardian.notificationConfig.receivesAttention === false && guardian.notificationConfig.receivesAlert === false ? (
                    <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5">仅紧急</span>
                  ) : null}
                  {guardian.permissions.receiveDailySummary ? <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5">每日摘要</span> : null}
                </div>
                <div className="text-[11px] text-slate-500">
                  {(guardian.currentStatus.distanceToPatient ?? 0) > 100000
                    ? `异地（${Math.round((guardian.currentStatus.distanceToPatient ?? 0) / 1000)}km away）`
                    : (guardian.currentStatus.distanceToPatient ?? 0) < 500
                      ? '在场'
                      : `${((guardian.currentStatus.distanceToPatient ?? 0) / 1000).toFixed(1)}km`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 升级时间线 */}
        {coordination.escalationTimeline.length > 0 ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
            <div className="text-sm text-slate-300">升级时间线</div>
            <div className="mt-4 space-y-3">
              {coordination.escalationTimeline.map((item) => (
                <div key={`${item.level}-${item.timestamp}`} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
                  <div>
                    <div className="text-sm text-slate-200">{item.reason}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString('zh-CN')} · {item.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <TeamSidebar />
    </div>
  )
}
