import { create } from 'zustand'

export type PortalType = 'patient' | 'guardian' | 'doctor'

export interface UserProfile {
  username: string
  displayName: string
}

export interface AppState {
  portal: PortalType
  page: string
  loggedIn: boolean
  userProfile: UserProfile | null
  setPortal: (portal: PortalType) => void
  setPage: (page: string) => void
  login: (userProfile: UserProfile) => void
  logout: () => void
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
  userProfile: null,
  setPortal: (portal) =>
    set(() => ({ portal, page: defaultPageByPortal[portal] })),
  setPage: (page) => set(() => ({ page })),
  login: (userProfile) => set(() => ({ loggedIn: true, userProfile })),
  logout: () => set(() => ({ loggedIn: false, userProfile: null }))
}))

export { useAlertsStore } from './alerts'
export { useCollaborationStore } from './collaboration'
export { useMemorialStore } from './memorial'
export { useMemorialWorkflowStore } from './memorialWorkflow'
export { usePatientJournalStore } from './patientJournal'
export { useRealtimeStore } from './realtime'
