import { useState } from 'react'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { useMemorialStore } from '../../store'

export const PatientSettings = () => {
  const memorial = useMemorialStore((state) => state.memorial)
  const [dailySummary, setDailySummary] = useState(true)
  const [postureReminder, setPostureReminder] = useState(true)
  const [nightMode, setNightMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 text-xs text-slate-400">主要联系人：陈先生</div>
        <div className="mt-2 text-xs text-slate-400">静默模式：{memorial.enabled ? '已开启' : '未开启'}</div>
        <div className="mt-2 text-xs text-slate-400">
          数据复用偏好：
          {memorial.allowFutureReuse === null ? ' 未设置' : memorial.allowFutureReuse ? ' 允许匿名复用' : ' 禁止匿名复用'}
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">通知与提醒</div>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>每日摘要推送</span>
            <input type="checkbox" checked={dailySummary} onChange={() => setDailySummary((prev) => !prev)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>体位提醒</span>
            <input type="checkbox" checked={postureReminder} onChange={() => setPostureReminder((prev) => !prev)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>夜间低刺激显示</span>
            <input type="checkbox" checked={nightMode} onChange={() => setNightMode((prev) => !prev)} />
          </label>
        </div>
      </div>
      <MemorialModeBanner />
    </div>
  )
}
