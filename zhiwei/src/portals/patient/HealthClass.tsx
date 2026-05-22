const classes = [
  { id: 'class-1', title: '早产风险的信号解读', duration: '8 分钟', level: '推荐' },
  { id: 'class-2', title: '卧床期间的呼吸调节', duration: '6 分钟', level: '基础' },
  { id: 'class-3', title: '夜间预警如何与家属协作', duration: '7 分钟', level: '推荐' }
]

export const HealthClass = () => {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">健康课堂</div>
      <div className="mt-4 space-y-3">
        {classes.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2 text-sm text-slate-200"
          >
            <div>
              <div className="text-sm text-[var(--text-primary)]">{item.title}</div>
              <div className="mt-1 text-xs text-slate-400">{item.duration}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] px-2 py-0.5 text-[11px] text-slate-400">
                {item.level}
              </span>
              <button
                type="button"
                className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1 text-xs text-white"
              >
                开始学习
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
