import { useState } from 'react'
import { useCollaborationStore } from '../../store/collaboration'

export const GuardianSettings = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const [quietHours, setQuietHours] = useState('22:00-07:00')
  const [dailySummary, setDailySummary] = useState(true)

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">家属设置</div>
        <p className="mt-3 text-xs text-slate-400">通知范围、成员权限与在岗时间可在此配置。</p>
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
    </div>
  )
}
