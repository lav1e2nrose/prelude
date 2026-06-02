import { useMemo, useState } from 'react'
import { useMemorialStore, useMemorialWorkflowStore } from '../../store'
import { usePrenatalStore, type AppointmentInput, type AppointmentSource } from '../../store/prenatal'
import { confirmDialog } from '../../store/dialog'
import { toast } from '../../store/toast'

const APPT_TYPES = ['产科门诊复诊', '超声检查', '宫颈长度评估', 'EHG 监测复盘', '血压 / 尿检', '糖耐量筛查', '胎心监护', '其他']

const startOfDay = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

interface DraftState {
  id: string | null
  date: number
  type: string
  location: string
  note: string
  source: AppointmentSource
}

export const PrenatalCalendar = () => {
  const memorialEnabled = useMemorialStore((s) => s.memorial.enabled)
  const historyAccessConfirmed = useMemorialWorkflowStore((s) => s.historyAccessConfirmed)
  const appointments = usePrenatalStore((s) => s.appointments)
  const addAppointment = usePrenatalStore((s) => s.addAppointment)
  const updateAppointment = usePrenatalStore((s) => s.updateAppointment)
  const removeAppointment = usePrenatalStore((s) => s.removeAppointment)

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(Date.now()))
  const [todayStart] = useState(() => startOfDay(Date.now()))
  const [editing, setEditing] = useState<DraftState | null>(null)

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
  const firstWeekday = (new Date(viewMonth.year, viewMonth.month, 1).getDay() + 6) % 7 // 周一=0

  const apptByDay = useMemo(() => {
    const map = new Map<number, number>()
    for (const a of appointments) {
      const d = new Date(a.date)
      if (d.getFullYear() === viewMonth.year && d.getMonth() === viewMonth.month) {
        const day = d.getDate()
        map.set(day, (map.get(day) ?? 0) + 1)
      }
    }
    return map
  }, [appointments, viewMonth])

  const selectedDayAppts = appointments
    .filter((a) => startOfDay(a.date) === selectedDay)
    .sort((a, b) => a.date - b.date)

  const openCreate = () => {
    const base = new Date(selectedDay)
    base.setHours(9, 0, 0, 0)
    setEditing({ id: null, date: base.getTime(), type: APPT_TYPES[0], location: '', note: '', source: 'patient' })
  }

  const openEdit = (id: string) => {
    const appt = appointments.find((a) => a.id === id)
    if (!appt) return
    setEditing({ id: appt.id, date: appt.date, type: appt.type, location: appt.location, note: appt.note, source: appt.source })
  }

  const saveDraft = () => {
    if (!editing) return
    const payload: AppointmentInput = {
      date: editing.date,
      type: editing.type,
      location: editing.location,
      note: editing.note,
      source: editing.source
    }
    if (editing.id) {
      updateAppointment(editing.id, payload)
      toast.success('已更新产检安排')
    } else {
      addAppointment(payload)
      toast.success('已添加产检安排', `${new Date(editing.date).toLocaleDateString('zh-CN')} · ${editing.type}`)
    }
    setEditing(null)
  }

  const deleteAppt = async (id: string) => {
    const ok = await confirmDialog({ title: '删除该产检安排？', confirmText: '删除', cancelText: '取消', tone: 'danger' })
    if (ok) {
      removeAppointment(id)
      toast.info('已删除产检安排')
    }
  }

  if (memorialEnabled && !historyAccessConfirmed) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6">
        <div className="text-sm text-slate-300">历史记录</div>
        <div className="mt-4 text-sm leading-7 text-slate-400">静默模式下不会主动显示日程提醒。如需回看既往安排，请在需要时手动进入。</div>
      </div>
    )
  }

  const monthLabel = `${viewMonth.year} 年 ${viewMonth.month + 1} 月`
  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => {
      const m = prev.month + delta
      const year = prev.year + Math.floor(m / 12)
      const month = ((m % 12) + 12) % 12
      return { year, month }
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      {/* 日历 */}
      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">产检日历</div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-md border border-[var(--border-subtle)] px-2 py-1 hover:bg-[var(--bg-2)]">‹</button>
            <span className="min-w-[88px] text-center text-[var(--text-primary)]">{monthLabel}</span>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-md border border-[var(--border-subtle)] px-2 py-1 hover:bg-[var(--bg-2)]">›</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-slate-500">
          {['一', '二', '三', '四', '五', '六', '日'].map((l) => (<div key={l}>{l}</div>))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }, (_u, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_u, idx) => {
            const day = idx + 1
            const count = apptByDay.get(day) ?? 0
            const ts = startOfDay(new Date(viewMonth.year, viewMonth.month, day).getTime())
            const isSelected = ts === selectedDay
            const isToday = ts === todayStart
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(ts)}
                className={`flex h-14 flex-col items-center justify-center rounded-lg border text-xs transition ${isSelected ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] bg-[var(--bg-2)] text-slate-300 hover:border-[var(--border-default)]'}`}
              >
                <span className={isToday ? 'font-semibold text-[var(--accent)]' : ''}>{day}</span>
                {count > 0 ? (
                  <span className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(3, count) }, (_d, i) => (<span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />))}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="mt-3 text-xs text-slate-500">圆点表示当天的产检安排。点击日期查看或编辑。</div>
      </section>

      {/* 选中日详情 + 编辑 */}
      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{new Date(selectedDay).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
          {!memorialEnabled ? (
            <button type="button" onClick={openCreate} className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1.5 text-xs text-white transition hover:brightness-110">+ 新增安排</button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          {selectedDayAppts.length > 0 ? (
            selectedDayAppts.map((a) => (
              <div key={a.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      {new Date(a.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · {a.type}
                      {a.status === 'done' ? <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">已完成</span> : null}
                    </div>
                    {a.location ? <div className="mt-1 text-xs text-slate-400">地点：{a.location}</div> : null}
                    {a.note ? <div className="mt-0.5 text-xs text-slate-400">{a.note}</div> : null}
                    <div className="mt-1 text-[11px] text-slate-500">来源：{a.source === 'doctor' ? '医生' : '本人'}</div>
                  </div>
                  {!memorialEnabled ? (
                    <div className="flex flex-shrink-0 gap-1">
                      {a.status === 'planned' ? (
                        <button type="button" onClick={() => { updateAppointment(a.id, { status: 'done' }); toast.success('已标记完成') }} className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[11px] text-slate-300 hover:bg-[var(--bg-1)]">完成</button>
                      ) : null}
                      <button type="button" onClick={() => openEdit(a.id)} className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[11px] text-slate-300 hover:bg-[var(--bg-1)]">编辑</button>
                      <button type="button" onClick={() => void deleteAppt(a.id)} className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/10">删除</button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] px-3 py-8 text-center text-sm text-slate-400">当天暂无产检安排</div>
          )}
        </div>
      </section>

      {/* 新增 / 编辑 模态 */}
      {editing ? (
        <div className="overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="modal-in w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-card)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-[var(--text-primary)]">{editing.id ? '编辑产检安排' : '新增产检安排'}</div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-slate-400">
                日期与时间
                <input
                  type="datetime-local"
                  value={(() => { const d = new Date(editing.date); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` })()}
                  onChange={(e) => setEditing((d) => (d ? { ...d, date: new Date(e.target.value).getTime() } : d))}
                  className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
              </label>
              <label className="block text-xs text-slate-400">
                类型
                <select value={editing.type} onChange={(e) => setEditing((d) => (d ? { ...d, type: e.target.value } : d))} className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  {APPT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                地点
                <input value={editing.location} onChange={(e) => setEditing((d) => (d ? { ...d, location: e.target.value } : d))} placeholder="如：门诊三楼 305" className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
              </label>
              <label className="block text-xs text-slate-400">
                备注
                <textarea value={editing.note} onChange={(e) => setEditing((d) => (d ? { ...d, note: e.target.value } : d))} placeholder="如：空腹，携带既往报告" className="mt-1 h-20 w-full resize-none rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                来源：
                {(['patient', 'doctor'] as const).map((src) => (
                  <button key={src} type="button" onClick={() => setEditing((d) => (d ? { ...d, source: src } : d))} className={`rounded-full border px-2.5 py-1 transition ${editing.source === src ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-slate-400'}`}>
                    {src === 'patient' ? '本人' : '医生'}
                  </button>
                ))}
                <span className="text-slate-500">（医生与本人可共同编辑）</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEditing(null)} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] text-sm text-slate-200 transition hover:bg-[var(--bg-2)]">取消</button>
              <button type="button" onClick={saveDraft} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] bg-[var(--accent)] text-sm font-semibold text-white transition hover:brightness-110">{editing.id ? '保存' : '添加'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
