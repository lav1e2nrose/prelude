import { useState } from 'react'

interface OverrideRecord {
  id: string
  timeLabel: string
  reason: string
}

export const OverridePanel = () => {
  const [reason, setReason] = useState('')
  const [records, setRecords] = useState<OverrideRecord[]>([])

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">医生覆盖流程</div>
      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div>1. 查看风险评分与解释面板</div>
        <div>2. 填写临床不同意理由并提交</div>
        <div>3. 自动写入算法反馈队列，供后续校正</div>
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="示例：患者体位变化导致瞬时波形增幅，临床判断不构成真实高危。"
        className="mt-4 h-24 w-full resize-none rounded-xl border border-white/10 bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = reason.trim()
          if (!trimmed) return
          const timestamp = Date.now()
          setRecords((prev) => [
            {
              id: `override-${timestamp}`,
              timeLabel: new Date(timestamp).toLocaleTimeString('zh-CN'),
              reason: trimmed
            },
            ...prev
          ])
          setReason('')
        }}
        className="mt-3 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white"
      >
        提交覆盖记录
      </button>
      {records.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-[var(--bg-2)]/60 p-3">
          <div className="text-xs text-slate-400">最近覆盖记录</div>
          {records.map((item) => (
            <div key={item.id} className="text-xs text-slate-200">
              {item.timeLabel} · {item.reason}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
