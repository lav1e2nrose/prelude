import { create } from 'zustand'

export type PortalType = 'patient' | 'guardian' | 'doctor'

export interface AppState {
  portal: PortalType
  page: string
  loggedIn: boolean
  mockScenario: number
  setPortal: (portal: PortalType) => void
  setPage: (page: string) => void
  setLoggedIn: (loggedIn: boolean) => void
  setMockScenario: (scenario: number) => void
}

const defaultPageByPortal: Record<PortalType, string> = {
  patient: 'HomeStatus',
  guardian: 'AtAGlance',
  doctor: 'PatientList'
}

export const useAppStore = create<AppState>((set) => ({
  portal: 'patient',
  page: defaultPageByPortal.patient,
  loggedIn: false,
  mockScenario: 1,
  setPortal: (portal) => set(() => ({ portal, page: defaultPageByPortal[portal] })),
  setPage: (page) => set(() => ({ page })),
  setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
  setMockScenario: (mockScenario) => set(() => ({ mockScenario }))
}))

export { useAlertsStore } from './alerts'
export { useCollaborationStore } from './collaboration'
export { useMemorialStore } from './memorial'
export { usePatientJournalStore } from './patientJournal'
export { useRealtimeStore } from './realtime'
