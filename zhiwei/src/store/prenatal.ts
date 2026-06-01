import { create } from 'zustand'

export type AppointmentSource = 'doctor' | 'patient'
export type AppointmentStatus = 'planned' | 'done'

export interface Appointment {
  id: string
  date: number // Unix ms（当天）
  type: string // 产检类型
  location: string
  note: string
  source: AppointmentSource
  status: AppointmentStatus
}

export interface AppointmentInput {
  date: number
  type: string
  location: string
  note: string
  source: AppointmentSource
}

interface PrenatalStore {
  appointments: Appointment[]
  addAppointment: (input: AppointmentInput) => void
  updateAppointment: (id: string, patch: Partial<AppointmentInput & { status: AppointmentStatus }>) => void
  removeAppointment: (id: string) => void
  loadDemo: () => void
  reset: () => void
}

const makeId = () => `appt-${Date.now()}-${Math.round(Math.random() * 1000)}`
const dayMs = 24 * 60 * 60 * 1000

const buildDemo = (): Appointment[] => {
  const base = new Date()
  base.setHours(9, 0, 0, 0)
  const at = (offsetDays: number, h: number) => {
    const d = new Date(base.getTime() + offsetDays * dayMs)
    d.setHours(h, 0, 0, 0)
    return d.getTime()
  }
  return [
    { id: makeId(), date: at(2, 9), type: '产科门诊复诊', location: '门诊三楼 305', note: '空腹，复查血压与宫高', source: 'doctor', status: 'planned' },
    { id: makeId(), date: at(9, 10), type: '超声 + 宫颈长度评估', location: '超声中心 2 室', note: '重点评估宫颈机能', source: 'doctor', status: 'planned' },
    { id: makeId(), date: at(-5, 14), type: 'EHG 监测复盘', location: '远程', note: '已完成，风险平稳', source: 'patient', status: 'done' }
  ]
}

export const usePrenatalStore = create<PrenatalStore>((set) => ({
  appointments: [],
  addAppointment: (input) =>
    set((state) => ({ appointments: [...state.appointments, { ...input, id: makeId(), status: 'planned' }] })),
  updateAppointment: (id, patch) =>
    set((state) => ({ appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  removeAppointment: (id) => set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) })),
  loadDemo: () => set(() => ({ appointments: buildDemo() })),
  reset: () => set(() => ({ appointments: [] }))
}))
