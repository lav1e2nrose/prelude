const classes = [
  { title: '早产风险的信号解读', duration: '8 分钟' },
  { title: '卧床期间的呼吸调节', duration: '6 分钟' }
]

export const HealthClass = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">健康课堂</div>
      <div className="mt-4 space-y-3">
        {classes.map((item) => (
          <div key={item.title} className="flex items-center justify-between text-sm text-slate-200">
            <span>{item.title}</span>
            <span className="text-xs text-slate-400">{item.duration}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
