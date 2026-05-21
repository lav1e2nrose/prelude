const feedbackItems = [
  { id: 'fb-001', note: '连续误报，建议调低敏感度', status: '待处理' },
  { id: 'fb-002', note: '夜间误报已覆盖', status: '已处理' }
]

export const AlgorithmFeedback = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">算法反馈队列</div>
      <div className="mt-4 space-y-3">
        {feedbackItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm text-slate-200">
            <span>{item.note}</span>
            <span className="text-xs text-slate-400">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
