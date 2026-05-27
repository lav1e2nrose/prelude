import { useState } from 'react'
import { useMemorialWorkflowStore } from '../../store'

export const DoctorSettings = () => {
  const doctorVisibleNotice = useMemorialWorkflowStore((state) => state.doctorVisibleNotice)
  const legalRetentionYears = useMemorialWorkflowStore((state) => state.legalRetentionYears)
  const currentPregnancyMode = useMemorialWorkflowStore((state) => state.currentPregnancyMode)
  const [threshold, setThreshold] = useState(65)
  const [dailyDigest, setDailyDigest] = useState(true)

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">医生端设置</div>
        <p className="mt-3 text-xs text-slate-400">通知阈值、模型版本与团队信息在此配置。</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">风险阈值</div>
        <div className="mt-3 text-xs text-slate-400">当风险评分高于 {threshold}% 时推送红色预警。</div>
        <input
          type="range"
          min={50}
          max={90}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
          className="mt-3 w-full"
        />
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">摘要通知</div>
        <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={dailyDigest} onChange={() => setDailyDigest((prev) => !prev)} />
          每日 18:00 发送患者总体摘要
        </label>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">数据留存</div>
        <div className="mt-2 text-xs text-slate-400">当前法定保留期：{legalRetentionYears} 年。用户 App 端删除与医疗机构留存按法规分离处理。</div>
        <div className="mt-2 text-xs text-slate-500">患者当前新孕程模式：{currentPregnancyMode}（医生端始终可见完整既往历史）。</div>
      </div>
      {doctorVisibleNotice ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-400">
          医疗协同状态：{doctorVisibleNotice}
        </div>
      ) : null}
    </div>
  )
}
