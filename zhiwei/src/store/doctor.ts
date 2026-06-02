import { create } from 'zustand'
import { DEMO_DOCTOR_PATIENTS, type DoctorPatient, type DoctorPatientStatus } from '../data/doctorPatients'
import type { RiskLevel } from '../types/signal'

// 医生端患者名册状态 + 当前选中患者（全端共享上下文）。
// 默认空（真实模式等待后端患者数据）；演示模式经 loadDemo() 载入名册。

export interface NewPatientInput {
  name: string
  week: string
  riskFactors: string[]
  level: RiskLevel
}

interface DoctorStore {
  patients: DoctorPatient[]
  selectedPatientId: string | null
  setSelectedPatient: (id: string) => void
  addPatient: (input: NewPatientInput) => void
  updateStatus: (id: string, status: DoctorPatientStatus) => void
  loadDemo: () => void
  reset: () => void
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  patients: [],
  selectedPatientId: null,
  setSelectedPatient: (id) => set(() => ({ selectedPatientId: id })),
  addPatient: (input) => {
    const id = `P-${String(get().patients.length + 1).padStart(3, '0')}-${Date.now() % 1000}`
    const patient: DoctorPatient = {
      id,
      name: input.name.trim() || '未命名患者',
      week: input.week.trim() || '—',
      riskFactors: input.riskFactors,
      contractionRate: '—',
      risk7d: input.level === 'alert' ? 15 : input.level === 'attention' ? 8 : 2,
      level: input.level,
      status: 'monitoring'
    }
    set((state) => ({ patients: [patient, ...state.patients], selectedPatientId: id }))
  },
  updateStatus: (id, status) =>
    set((state) => ({ patients: state.patients.map((p) => (p.id === id ? { ...p, status } : p)) })),
  loadDemo: () =>
    set(() => ({ patients: DEMO_DOCTOR_PATIENTS, selectedPatientId: 'P-002' })),
  reset: () => set(() => ({ patients: [], selectedPatientId: null }))
}))
