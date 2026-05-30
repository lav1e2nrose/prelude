import { useState } from 'react'
import { CountdownCallButton } from '../../components/shared/CountdownCallButton'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { useMemorialStore, useMemorialWorkflowStore } from '../../store'
import { useAlertsStore } from '../../store/alerts'
import { useCollaborationStore } from '../../store/collaboration'
import { useRealtimeStore } from '../../store/realtime'
import { usePatientJournalStore } from '../../store/patientJournal'

export const AtAGlance = () => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const guardianVisibleNotice = useMemorialWorkflowStore((state) => state.guardianVisibleNotice)
  const remoteGuardianSuppressedCount = useMemorialWorkflowStore((state) => state.remoteGuardianSuppressedCount)
  const alerts = useAlertsStore((state) => state.alerts)
  const latestAlert = alerts[0]
  const pending = alerts.filter((a) => !a.acknowledged).length
  const guardians = useCollaborationStore((state) => state.guardians)
  const coordination = useCollaborationStore((state) => state.coordination)
  const primaryGuardian = guardians.find((g) => g.id === coordination.primaryResponder)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const contractions = usePatientJournalStore((state) => state.contractions)
  const fetalMovements = usePatientJournalStore((state) => state.fetalMovements)

  const [sixHoursAgo] = useState(() => Date.now() - 6 * 60 * 60 * 1000)
  const recentContractions = contractions.filter((c) => c.timestamp >= sixHoursAgo)
  const recentMovements = fetalMovements.filter((m) => m.timestamp >= sixHoursAgo)

  const postureLabelMap: Record<string, string> = {
    standing: '站立', sitting: '坐姿', lying_left: '左侧卧',
    lying_right: '右侧卧', lying_back: '平躺', unknown: '未知'
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-[var(--text-primary)]">
        {memorialEnabled ? '账户状态' : '张小雅 · 孕 32 周 + 3 天'}
      </div>

      {/* 主状态卡 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-5">
        <div className="flex flex-wrap items-center gap-6">
          <StatusOrb level={latestAlert?.level ?? 'attention'} label={memorialEnabled ? '账户状态' : '实时状态'} />
          <div>
            <div className="text-2xl font-semibold text-[var(--text-primary)]">
              {memorialEnabled ? '—' : latestAlert?.level === 'safe' ? '平稳' : latestAlert?.level === 'attention' ? '需留意' : latestAlert?.level === 'alert' ? '风险升高' : '紧急'}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {memorialEnabled ? '当前不接收主动提醒。' : `上次更新 ${latestAlert ? '刚刚' : '2 分钟前'} · 待处理预警 ${pending} 条`}
            </div>
          </div>
        </div>
      </div>

      {/* 过去 6 小时统计 */}
      {!memorialEnabled ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
            <div className="text-xs text-slate-400">过去 6 小时 · 宫缩</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{recentContractions.length}</div>
            <div className="mt-1 text-xs text-slate-500">
              {recentContractions.filter((c) => c.intensity === '轻度').length > 0
                ? `${recentContractions.filter((c) => c.intensity === '轻度').length} 次假性`
                : '暂无'}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
            <div className="text-xs text-slate-400">过去 6 小时 · 胎动</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{recentMovements.length}</div>
            <div className="mt-1 text-xs text-slate-500">正常范围</div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
            <div className="text-xs text-slate-400">当前状态</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {postureLabelMap[latestFrame?.posture ?? 'unknown']}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              电量 {latestFrame?.batteryLevel ? `${Math.round(latestFrame.batteryLevel)}%` : '81%'}
            </div>
          </div>
        </div>
      ) : null}

      {/* 协作响应状态 */}
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

      {/* 快捷操作 */}
      {!memorialEnabled ? (
        <div className="grid gap-3 md:grid-cols-2">
          <CountdownCallButton
            label="给张小雅打电话"
            onConfirm={() => {}}
          />
          <button
            type="button"
            className="min-h-[52px] rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-2 text-sm text-slate-200 transition hover:bg-[var(--bg-2)]"
          >
            发消息给家属群
          </button>
        </div>
      ) : null}

      {/* 设备状态 */}
      {!memorialEnabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">设备状态</div>
          <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>设备电量</span>
              <span>{latestFrame?.batteryLevel ? `${Math.round(latestFrame.batteryLevel)}%` : '81%'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>电极质量</span>
              <span>{latestFrame?.electrodeQuality ? `${latestFrame.electrodeQuality}%` : '92%'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>最近同步</span>
              <span>30 秒前</span>
            </div>
          </div>
        </div>
      ) : null}

      {guardianVisibleNotice ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3 text-xs text-slate-400">
          {guardianVisibleNotice}
        </div>
      ) : null}
      {remoteGuardianSuppressedCount > 0 ? (
        <div className="text-xs text-slate-500">
          信息隔离协议：{remoteGuardianSuppressedCount} 位异地家属未收到主动通知。
        </div>
      ) : null}
    </div>
  )
}
