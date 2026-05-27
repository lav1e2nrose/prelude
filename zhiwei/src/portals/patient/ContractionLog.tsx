import { useState } from 'react'
import { FalsePositiveFeedback } from '../../components/shared/FalsePositiveFeedback'
import { useMemorialStore, useMemorialWorkflowStore, usePatientJournalStore } from '../../store'

const intensityColor: Record<string, string> = {
  轻度: 'bg-emerald-500/20 text-emerald-200',
  中等: 'bg-amber-500/20 text-amber-100',
  偏强: 'bg-orange-500/20 text-orange-100',
  强烈: 'bg-rose-500/20 text-rose-100'
}

export const ContractionLog = () => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const historyAccessConfirmed = useMemorialWorkflowStore((state) => state.historyAccessConfirmed)
  const logs = usePatientJournalStore((state) => state.contractions)
  const addContraction = usePatientJournalStore((state) => state.addContraction)
  const markContractionFalsePositive = usePatientJournalStore((state) => state.markContractionFalsePositive)
  const [manualDuration, setManualDuration] = useState(40)
  const [manualIntensity, setManualIntensity] = useState<'轻度' | '中等' | '偏强' | '强烈'>('中等')
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const summary = (() => {
    if (logs.length === 0) return { average: 0, longest: 0 }
    const durations = logs.map((log) => log.durationSec)
    const total = durations.reduce((sum, value) => sum + value, 0)
    const average = Math.round(total / durations.length)
    const longest = Math.max(...durations)
    return { average, longest }
  })()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const logsByDay = (() => {
    const map = new Map<number, number>()
    for (const log of logs) {
      const date = new Date(log.timestamp)
      if (date.getFullYear() !== year || date.getMonth() !== month) continue
      const day = date.getDate()
      map.set(day, (map.get(day) ?? 0) + 1)
    }
    return map
  })()

  const selectedDayLogs = logs
    .filter((log) => {
      const date = new Date(log.timestamp)
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === selectedDay
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  const selectedLog = selectedDayLogs.find((item) => item.id === selectedLogId) ?? selectedDayLogs.at(-1) ?? null

  if (memorialEnabled && !historyAccessConfirmed) {
    return (
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6">
          <div className="text-sm text-slate-300">历史记录</div>
          <div className="mt-3 text-sm text-slate-400">静默模式下默认隐藏宫缩详情。请在设置中手动确认“查看历史数据”后访问。</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {memorialEnabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-400">
          已进入手动历史查看模式，不展示期待性字段与导出快捷入口。
        </div>
      ) : null}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">今日宫缩记录</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">记录次数</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{logs.length}</div>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">平均时长</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{summary.average}s</div>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
            <div className="text-xs text-slate-400">最长时长</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{summary.longest}s</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">日历视图</div>
            <div className="text-xs text-slate-400">
              {year} 年 {month + 1} 月
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
            {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: daysInMonth }, (_unused, idx) => {
              const day = idx + 1
              const count = logsByDay.get(day) ?? 0
              const isSelected = selectedDay === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-12 rounded-lg border text-xs ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-2)] text-slate-300'
                  }`}
                >
                  <div>{day}</div>
                  <div className="mt-1 flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(3, count) }, (_unusedDot, dotIndex) => (
                      <span key={`${day}-${dotIndex}`} className="h-1.5 w-1.5 rounded-full bg-[var(--alert)]" />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">{month + 1}-{selectedDay.toString().padStart(2, '0')} 时间轴详情</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-2">
                时长
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={manualDuration}
                  onChange={(event) => setManualDuration(Number(event.target.value))}
                  className="w-20 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1 text-xs text-[var(--text-primary)]"
                />
                s
              </label>
              <label className="flex items-center gap-2">
                强度
                <select
                  value={manualIntensity}
                  onChange={(event) => setManualIntensity(event.target.value as '轻度' | '中等' | '偏强' | '强烈')}
                  className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1 text-xs text-[var(--text-primary)]"
                >
                  <option value="轻度">轻度</option>
                  <option value="中等">中等</option>
                  <option value="偏强">偏强</option>
                  <option value="强烈">强烈</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  addContraction({
                    durationSec: manualDuration,
                    intensity: manualIntensity,
                    source: 'manual'
                  })
                }}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1 text-xs text-slate-300"
              >
                手动记录
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {selectedDayLogs.length > 0 ? (
              selectedDayLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLogId(log.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                    selectedLog?.id === log.id
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-2)]/70 text-slate-200'
                  }`}
                >
                  <span>{new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{log.durationSec}s</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${intensityColor[log.intensity] ?? 'bg-[var(--bg-1)]'}`}>
                    {log.intensity}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-subtle)] px-3 py-6 text-center text-sm text-slate-400">
                当天暂无宫缩记录
              </div>
            )}
          </div>

          {selectedLog ? (
            <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3 text-xs text-slate-300">
              <div>来源：{selectedLog.source === 'manual' ? '手动记录' : '算法识别'}</div>
              <div className="mt-1">状态：{selectedLog.status === 'false_positive' ? '已标记误报' : selectedLog.status === 'pending' ? '待确认' : '已确认'}</div>
              <div className="mt-3">
                <FalsePositiveFeedback onFeedback={() => markContractionFalsePositive(selectedLog.id)} />
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
