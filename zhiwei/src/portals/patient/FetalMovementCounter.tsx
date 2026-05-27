import { useEffect, useMemo, useRef, useState } from 'react'
import { useMemorialStore, useMemorialWorkflowStore, usePatientJournalStore, useRealtimeStore } from '../../store'

const goal = 36

export const FetalMovementCounter = () => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const historyAccessConfirmed = useMemorialWorkflowStore((state) => state.historyAccessConfirmed)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const movements = usePatientJournalStore((state) => state.fetalMovements)
  const addFetalMovement = usePatientJournalStore((state) => state.addFetalMovement)
  const removeLastManualFetalMovement = usePatientJournalStore((state) => state.removeLastManualFetalMovement)
  const [pulse, setPulse] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const lastAutoCapture = useRef(0)

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const dayStartMs = startOfDay.getTime()

  const todayMovements = movements.filter((item) => item.timestamp >= dayStartMs)
  const count = todayMovements.length
  const progress = Math.min(100, Math.round((count / goal) * 100))

  useEffect(() => {
    if (latestFrame?.fetalMovement !== 1) return
    const ts = latestFrame.timestamp
    if (ts - lastAutoCapture.current < 30 * 1000) return
    lastAutoCapture.current = ts
    addFetalMovement('algorithm', ts)
  }, [addFetalMovement, latestFrame])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.getAttribute('contenteditable') === 'true'
      if (isTyping) return
      if (event.code === 'Space') {
        event.preventDefault()
        addFetalMovement('manual')
        setPulse(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addFetalMovement])

  useEffect(() => {
    if (!pulse) return
    const timer = window.setTimeout(() => setPulse(false), 220)
    return () => window.clearTimeout(timer)
  }, [pulse])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000 * 15)
    return () => window.clearInterval(timer)
  }, [])

  const hourly = useMemo(() => {
    const result = Array.from({ length: 12 }, (_unused, idx) => {
      const hourStart = now - (11 - idx) * 60 * 60 * 1000
      const hourEnd = hourStart + 60 * 60 * 1000
      const value = movements.filter((item) => item.timestamp >= hourStart && item.timestamp < hourEnd).length
      return { label: `${new Date(hourStart).getHours()}:00`, value }
    })
    return result
  }, [movements, now])

  const currentHourCount = hourly.at(-1)?.value ?? 0
  const latest = todayMovements[0]

  if (memorialEnabled && !historyAccessConfirmed) {
    return (
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6">
          <div className="text-sm text-slate-300">历史记录</div>
          <div className="mt-3 text-sm text-slate-400">静默模式下默认不展示胎动统计。请在设置中确认后再手动查看历史数据。</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      {memorialEnabled ? <div className="text-xs text-slate-400">当前为手动历史查看模式。</div> : null}
      <div className="text-sm text-slate-300">胎动计数</div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-4">
          <div className="text-center text-xs text-slate-400">今天的胎动</div>
          <div className="mt-2 text-center text-4xl font-semibold text-[var(--text-primary)]">{count}</div>
          <div className="mt-1 text-center text-xs text-slate-400">已记录 {Math.max(1, Math.round((now - dayStartMs) / (1000 * 60 * 60)))} 小时</div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                addFetalMovement('manual')
                setPulse(true)
              }}
              className={`flex h-[220px] w-[220px] items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--accent-dim)] text-lg font-semibold text-[var(--text-primary)] shadow-[var(--shadow-card)] ${
                pulse ? 'scale-[1.03]' : ''
              }`}
            >
              感受到了
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-slate-400">
            最近一次 {latest ? `${Math.max(1, Math.round((now - latest.timestamp) / (1000 * 60)))} 分钟前` : '--'} · 本小时 {currentHourCount} 次
          </div>

          <div className="mt-3 h-2 rounded-full bg-[var(--bg-1)]">
            <div className="h-full rounded-full bg-[var(--safe)]" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => removeLastManualFetalMovement()}
              className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-300"
            >
              撤销
            </button>
            <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-400">
              快捷键：空格
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">近 12 小时趋势</div>
            <div className="text-xs text-slate-400">手动 + 设备自动去重计数</div>
          </div>
          <div className="mt-4 flex h-48 items-end gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)]/70 p-3">
            {hourly.map((item) => {
              const height = Math.max(6, item.value * 14)
              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-[var(--accent)]/70" style={{ height }} />
                  <div className="text-[10px] text-slate-400">{item.label.split(':')[0]}</div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-slate-400">ⓘ 设备通过 IMU + EHG 自动计数，并与手动记录合并去重。</div>
        </div>
      </div>
    </div>
  )
}
