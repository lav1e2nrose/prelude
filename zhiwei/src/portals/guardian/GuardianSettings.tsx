import { useState } from 'react'
import { useMemorialWorkflowStore } from '../../store'
import { useCollaborationStore } from '../../store/collaboration'

export const GuardianSettings = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const triggerGuardianInitiatedMemorial = useMemorialWorkflowStore((state) => state.triggerGuardianInitiatedMemorial)
  const guardianVisibleNotice = useMemorialWorkflowStore((state) => state.guardianVisibleNotice)
  const remoteGuardianSuppressedCount = useMemorialWorkflowStore((state) => state.remoteGuardianSuppressedCount)
  const requestSupportHelp = useMemorialWorkflowStore((state) => state.requestSupportHelp)
  const [quietHours, setQuietHours] = useState('22:00-07:00')
  const [dailySummary, setDailySummary] = useState(true)

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">家属设置</div>
        <p className="mt-3 text-xs text-slate-400">通知范围、成员权限与在岗时间可在此配置。</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">紧急援助（通道 C）</div>
        <p className="mt-3 text-xs text-slate-400">当患者暂时无法或不愿意自行操作时，您可以代为暂停所有提醒。</p>
        <button
          type="button"
          onClick={() => triggerGuardianInitiatedMemorial('陈先生')}
          className="mt-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
        >
          代为操作记忆模式
        </button>
        {guardianVisibleNotice ? <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-300">{guardianVisibleNotice}</div> : null}
        {remoteGuardianSuppressedCount > 0 ? (
          <div className="mt-2 text-xs text-slate-500">信息隔离协议：已对 {remoteGuardianSuppressedCount} 位异地家属保持被动可见，不主动通知。</div>
        ) : null}
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">静默时段</div>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
          <input
            value={quietHours}
            onChange={(event) => setQuietHours(event.target.value)}
            className="w-40 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-sm text-[var(--text-primary)]"
          />
          <span className="text-xs text-slate-400">紧急预警自动突破静默限制</span>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={dailySummary} onChange={() => setDailySummary((prev) => !prev)} />
          每日状态摘要推送至全部成员
        </label>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">成员通知矩阵</div>
        <div className="mt-4 space-y-3">
          {guardians.map((guardian) => (
            <div key={guardian.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>{guardian.name}</span>
                <span className="text-xs text-slate-400">{guardian.relationship}</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={guardian.notificationConfig.receivesAttention} />
                  关注级通知
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={guardian.notificationConfig.receivesAlert} />
                  预警级通知
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={guardian.notificationConfig.receivesEmergency} />
                  紧急通知
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <button
          type="button"
          onClick={requestSupportHelp}
          className="text-xs text-[var(--text-muted)] underline underline-offset-4"
        >
          需要帮助？联系我们 →
        </button>
      </div>
    </div>
  )
}
