import { useState } from 'react'

export const DoctorSettings = () => {
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
        <div className="mt-2 text-xs text-slate-400">默认保存 5 年，可申请延长用于科研分析。</div>
      </div>
    </div>
  )
}
