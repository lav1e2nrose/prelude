import { create } from 'zustand'
import type { AuthSession, PatientProfile, UserRole } from '../types/user'

// 角色即门户。一个账户对应且仅对应一个角色，会话期间不可切换；换角色须退出登录。
export type PortalType = UserRole

export interface AppState {
  session: AuthSession | null
  /** 受监测的孕妇档案（三端共享视角的数据来源；禁止组件内硬编码业务数据） */
  patient: PatientProfile | null
  /** 当前门户 = 会话角色。仅作只读派生，不提供运行时自由切换。 */
  portal: PortalType
  page: string
  loggedIn: boolean
  login: (session: AuthSession, patient: PatientProfile) => void
  logout: () => void
  setPage: (page: string) => void
}

const defaultPageByPortal: Record<PortalType, string> = {
  patient: 'HomeStatus',
  guardian: 'AtAGlance',
  doctor: 'PatientList'
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  patient: null,
  portal: 'patient',
  page: defaultPageByPortal.patient,
  loggedIn: false,
  login: (session, patient) =>
    set(() => ({
      session,
      patient,
      loggedIn: true,
      portal: session.role,
      page: defaultPageByPortal[session.role]
    })),
  logout: () =>
    set(() => ({
      session: null,
      patient: null,
      loggedIn: false,
      portal: 'patient',
      page: defaultPageByPortal.patient
    })),
  setPage: (page) => set(() => ({ page }))
}))

export { useAlertsStore } from './alerts'
export { useCollaborationStore } from './collaboration'
export { useMemorialStore } from './memorial'
export { useMemorialWorkflowStore } from './memorialWorkflow'
export { usePatientJournalStore } from './patientJournal'
export { useRealtimeStore } from './realtime'
export { useSettingsStore } from './settings'
