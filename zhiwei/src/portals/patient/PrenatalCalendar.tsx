const schedule = [
  { date: '05-23', label: '产检复诊 · 血压评估' },
  { date: '05-29', label: 'EHG 监测复盘' }
]

export const PrenatalCalendar = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">产检日历</div>
      <div className="mt-4 space-y-3">
        {schedule.map((item) => (
          <div key={item.date} className="flex items-center justify-between text-sm text-slate-200">
            <span>{item.date}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
