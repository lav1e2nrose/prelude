import { useMemorialStore } from '../../store'

const schedule = [
  { date: 23, label: '产检复诊 · 血压评估' },
  { date: 29, label: 'EHG 监测复盘' }
]

export const PrenatalCalendar = () => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const days = Array.from({ length: 30 }, (_, index) => index + 1)

  if (memorialEnabled) {
    return (
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6">
          <div className="text-sm text-slate-300">历史记录</div>
          <div className="mt-4 text-sm leading-7 text-slate-400">
            静默模式下不会主动显示日程提醒。如需回看既往安排，请在需要时手动进入相关记录页面。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">产检日历</div>
          <div className="text-xs text-slate-400">2026 年 05 月</div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-400">
          {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const event = schedule.find((item) => item.date === day)
            return (
              <div
                key={day}
                className={`flex h-10 flex-col items-center justify-center rounded-lg border text-xs ${
                  event
                    ? 'border-[var(--alert)]/40 bg-[var(--alert)]/15 text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-2)] text-slate-300'
                }`}
              >
                <span>{day}</span>
                {event ? <span className="text-[10px]">产检</span> : null}
              </div>
            )
          })}
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">即将到来</div>
        <div className="mt-3 space-y-3">
          {schedule.map((item) => (
            <div key={item.date} className="flex items-center justify-between text-sm text-slate-200">
              <span>05-{item.date}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
