import { create } from 'zustand'
import type { AdverseOutcomeType } from '../types/memorial'
import { useCollaborationStore } from './collaboration'
import { useMemorialStore } from './memorial'

type TriggerChannel = 'A' | 'B' | 'C' | 'D' | 'E'
type PregnancyStartChoice = 'fresh_start' | 'reuse_history' | 'undecided'
type TrackedPatientStatus = 'monitoring' | 'memorial' | 'ended'

interface TriggerLogItem {
  id: string
  channel: TriggerChannel
  source: 'patient' | 'guardian' | 'doctor' | 'system_auto' | 'support'
  detail: string
  timestamp: number
}

interface DoctorPendingSync {
  active: boolean
  startedAt: number | null
  executeAt: number | null
  outcomeType: AdverseOutcomeType
  autoFollowupIn7Days: boolean
}

interface MemorialWorkflowStore {
  triggerLog: TriggerLogItem[]
  inactivityDays: number
  passivePromptVisible: boolean
  passiveEmailSent: boolean
  historyAccessConfirmed: boolean
  pendingHistoryConfirm: boolean
  patientDelegationPendingChoice: boolean
  patientVisibleNotice: string | null
  guardianVisibleNotice: string | null
  doctorVisibleNotice: string | null
  remoteGuardianSuppressedCount: number
  doctorPendingSync: DoctorPendingSync
  trackedPatientStatus: TrackedPatientStatus
  deletionState: 'none' | 'soft_deleted' | 'hard_deleted'
  deletionRequestedAt: number | null
  hardDeleteAt: number | null
  legalRetentionYears: number
  currentPregnancyMode: 'default' | 'fresh_start' | 'reuse_history'
  pregnancyVersion: number
  doctorCanSeeFullHistory: boolean
  setInactivityDays: (days: number) => void
  requestHistoryAccess: () => void
  cancelHistoryAccess: () => void
  confirmHistoryAccess: () => void
  triggerPatientInitiatedMemorial: (choice: 'pause_keep_data' | 'export_and_delete', outcomeType: AdverseOutcomeType | null) => void
  triggerGuardianInitiatedMemorial: (operatorName: string) => void
  resolveGuardianDelegation: (decision: 'keep_pause' | 'self_decide') => void
  startDoctorSyncWindow: (outcomeType: AdverseOutcomeType) => void
  cancelDoctorSyncWindow: () => void
  executeDoctorSync: () => void
  setDoctorFollowupOption: (enabled: boolean) => void
  markManualMemorialExit: () => void
  requestSupportHelp: () => void
  processRetentionDeadline: () => void
  recoverSoftDeletedData: () => void
  startNewPregnancy: (choice: PregnancyStartChoice) => void
}

const SOFT_DELETE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const DOCTOR_SYNC_WINDOW_MS = 60 * 1000
const GUARDIAN_PROXIMITY_THRESHOLD_METERS = 5000

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`

export const useMemorialWorkflowStore = create<MemorialWorkflowStore>((set) => ({
  triggerLog: [],
  inactivityDays: 0,
  passivePromptVisible: false,
  passiveEmailSent: false,
  historyAccessConfirmed: false,
  pendingHistoryConfirm: false,
  patientDelegationPendingChoice: false,
  patientVisibleNotice: null,
  guardianVisibleNotice: null,
  doctorVisibleNotice: null,
  remoteGuardianSuppressedCount: 0,
  doctorPendingSync: {
    active: false,
    startedAt: null,
    executeAt: null,
    outcomeType: 'iufd',
    autoFollowupIn7Days: false
  },
  trackedPatientStatus: 'monitoring',
  deletionState: 'none',
  deletionRequestedAt: null,
  hardDeleteAt: null,
  legalRetentionYears: 5,
  currentPregnancyMode: 'default',
  pregnancyVersion: 1,
  doctorCanSeeFullHistory: true,
  setInactivityDays: (days) =>
    set((state) => {
      const normalized = Math.max(0, Math.round(days))
      const shouldPrompt = normalized >= 8
      const shouldSendEmail = normalized > 30 && !state.passiveEmailSent
      const now = Date.now()
      return {
        inactivityDays: normalized,
        passivePromptVisible: shouldPrompt,
        passiveEmailSent: state.passiveEmailSent || shouldSendEmail,
        triggerLog: shouldSendEmail
          ? [
              {
                id: makeId('trigger'),
                channel: 'B',
                source: 'system_auto',
                detail: '超过 30 天未使用，仅发送一次中性邮件提醒登录后可调整账户状态。',
                timestamp: now
              },
              ...state.triggerLog
            ]
          : state.triggerLog
      }
    }),
  requestHistoryAccess: () => set(() => ({ pendingHistoryConfirm: true })),
  cancelHistoryAccess: () => set(() => ({ pendingHistoryConfirm: false })),
  confirmHistoryAccess: () => set(() => ({ pendingHistoryConfirm: false, historyAccessConfirmed: true })),
  triggerPatientInitiatedMemorial: (choice, outcomeType) =>
    set((state) => {
      const now = Date.now()
      const memorialStore = useMemorialStore.getState()
      if (choice === 'pause_keep_data') {
        memorialStore.enterMemorialMode('patient')
      }
      const legalRetentionYears = outcomeType === 'medical_termination' ? 30 : 5
      return {
        legalRetentionYears,
        deletionState: choice === 'export_and_delete' ? 'soft_deleted' : state.deletionState,
        deletionRequestedAt: choice === 'export_and_delete' ? now : state.deletionRequestedAt,
        hardDeleteAt: choice === 'export_and_delete' ? now + SOFT_DELETE_WINDOW_MS : state.hardDeleteAt,
        trackedPatientStatus: choice === 'pause_keep_data' ? 'memorial' : 'ended',
        patientVisibleNotice:
          choice === 'pause_keep_data'
            ? '您已暂停所有提醒。此操作可撤回。'
            : '您的账户已进入 30 天恢复窗口，期间可恢复数据访问。',
        doctorVisibleNotice:
          choice === 'pause_keep_data'
            ? '患者主动进入静默模式（未说明原因）。请评估是否需要随访。'
            : '患者发起导出并注销流程，账户处于软删除期。',
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'A',
            source: 'patient',
            detail:
              choice === 'pause_keep_data'
                ? '患者主动暂停所有提醒并保留数据。'
                : `患者选择导出后注销，进入 30 天恢复窗口（法定保留 ${legalRetentionYears} 年）。`,
            timestamp: now
          },
          ...state.triggerLog
        ]
      }
    }),
  triggerGuardianInitiatedMemorial: (operatorName) =>
    set((state) => {
      const now = Date.now()
      useMemorialStore.getState().enterMemorialMode('guardian')
      return {
        trackedPatientStatus: 'memorial',
        patientDelegationPendingChoice: true,
        patientVisibleNotice: `${operatorName} 在 ${new Date(now).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })} 暂停了知微的所有提醒。`,
        guardianVisibleNotice: `${operatorName} 已代为暂停提醒，患者可在打开 App 后继续保持或恢复。`,
        doctorVisibleNotice: '家属代为操作静默模式。建议主动联系患者评估。',
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'C',
            source: 'guardian',
            detail: `${operatorName} 触发家属代操作通道，立即关闭提醒并同步医生端。`,
            timestamp: now
          },
          ...state.triggerLog
        ]
      }
    }),
  resolveGuardianDelegation: (decision) =>
    set((state) => {
      if (decision === 'self_decide') {
        useMemorialStore.getState().exitMemorialMode()
      }
      return {
        patientDelegationPendingChoice: false,
        patientVisibleNotice:
          decision === 'keep_pause'
            ? '您选择继续保持暂停状态。'
            : '您已恢复为自行决定账户状态，常规提醒可在设置中调整。',
        trackedPatientStatus: decision === 'keep_pause' ? 'memorial' : 'monitoring',
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'C',
            source: 'patient',
            detail: decision === 'keep_pause' ? '患者确认继续保持静默状态。' : '患者选择恢复自主决策并退出静默。',
            timestamp: Date.now()
          },
          ...state.triggerLog
        ]
      }
    }),
  startDoctorSyncWindow: (outcomeType) =>
    set((state) => {
      const now = Date.now()
      return {
        doctorPendingSync: {
          active: true,
          startedAt: now,
          executeAt: now + DOCTOR_SYNC_WINDOW_MS,
          outcomeType,
          autoFollowupIn7Days: false
        },
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'D',
            source: 'doctor',
            detail: `医生录入 ${outcomeType}，已开启 60 秒同步窗口。`,
            timestamp: now
          },
          ...state.triggerLog
        ]
      }
    }),
  cancelDoctorSyncWindow: () =>
    set((state) => ({
      doctorPendingSync: {
        ...state.doctorPendingSync,
        active: false,
        startedAt: null,
        executeAt: null
      },
      triggerLog: [
        {
          id: makeId('trigger'),
          channel: 'D',
          source: 'doctor',
          detail: '医生取消同步处理，未执行账户状态变更。',
          timestamp: Date.now()
        },
        ...state.triggerLog
      ]
    })),
  executeDoctorSync: () =>
    set((state) => {
      const now = Date.now()
      const guardians = useCollaborationStore.getState().guardians
      const notifiedGuardians = guardians.filter(
        (guardian) =>
          guardian.isPrimaryContact ||
          (guardian.currentStatus.distanceToPatient ?? Number.POSITIVE_INFINITY) < GUARDIAN_PROXIMITY_THRESHOLD_METERS
      )
      const suppressedCount = Math.max(0, guardians.length - notifiedGuardians.length)
      useMemorialStore.getState().enterMemorialMode('doctor')

      return {
        trackedPatientStatus: 'ended',
        guardianVisibleNotice:
          notifiedGuardians.length > 0
            ? `警报已结束。已通知：${notifiedGuardians.map((item) => item.name).join('、')}`
            : '警报已结束。',
        patientVisibleNotice: '您的主治医生已为您调整账户状态。',
        doctorVisibleNotice: '同步已执行：警报关闭、患者转入已结束队列。',
        remoteGuardianSuppressedCount: suppressedCount,
        doctorPendingSync: {
          ...state.doctorPendingSync,
          active: false,
          startedAt: null,
          executeAt: null
        },
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'D',
            source: 'doctor',
            detail: `医生执行同步，异地家属 ${suppressedCount} 人按信息隔离协议不主动通知。`,
            timestamp: now
          },
          ...state.triggerLog
        ]
      }
    }),
  setDoctorFollowupOption: (enabled) =>
    set((state) => ({
      doctorPendingSync: {
        ...state.doctorPendingSync,
        autoFollowupIn7Days: enabled
      }
    })),
  markManualMemorialExit: () =>
    set((state) => ({
      trackedPatientStatus: state.deletionState === 'none' ? 'monitoring' : state.trackedPatientStatus,
      patientVisibleNotice: '您已恢复常规模式。',
      triggerLog: [
        {
          id: makeId('trigger'),
          channel: 'A',
          source: 'patient',
          detail: '患者手动撤回静默模式。',
          timestamp: Date.now()
        },
        ...state.triggerLog
      ]
    })),
  requestSupportHelp: () =>
    set((state) => ({
      triggerLog: [
        {
          id: makeId('trigger'),
          channel: 'E',
          source: 'support',
          detail: '用户通过人工客服通道请求帮助。',
          timestamp: Date.now()
        },
        ...state.triggerLog
      ]
    })),
  processRetentionDeadline: () =>
    set((state) => {
      if (state.deletionState !== 'soft_deleted' || !state.hardDeleteAt) return state
      if (Date.now() < state.hardDeleteAt) return state
      return {
        deletionState: 'hard_deleted',
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'A',
            source: 'system_auto',
            detail: '30 天恢复窗口已结束，账户进入硬删除状态。',
            timestamp: Date.now()
          },
          ...state.triggerLog
        ]
      }
    }),
  recoverSoftDeletedData: () =>
    set((state) => {
      if (state.deletionState !== 'soft_deleted') return state
      const canRecover = state.hardDeleteAt ? Date.now() < state.hardDeleteAt : false
      if (!canRecover) return state
      return {
        deletionState: 'none',
        deletionRequestedAt: null,
        hardDeleteAt: null,
        patientVisibleNotice: '欢迎回来。账户与数据访问已恢复。',
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'A',
            source: 'patient',
            detail: '用户在 30 天内恢复软删除账户。',
            timestamp: Date.now()
          },
          ...state.triggerLog
        ]
      }
    }),
  startNewPregnancy: (choice) =>
    set((state) => {
      if (choice === 'undecided') {
        return {
          triggerLog: [
            {
              id: makeId('trigger'),
              channel: 'A',
              source: 'patient',
              detail: '用户选择暂不开始新的孕程。',
              timestamp: Date.now()
            },
            ...state.triggerLog
          ]
        }
      }
      useMemorialStore.getState().exitMemorialMode()
      return {
        currentPregnancyMode: choice,
        pregnancyVersion: state.pregnancyVersion + 1,
        trackedPatientStatus: 'monitoring',
        historyAccessConfirmed: false,
        pendingHistoryConfirm: false,
        patientDelegationPendingChoice: false,
        patientVisibleNotice: choice === 'fresh_start' ? '已创建全新孕程，患者端不显示既往引用。' : '已创建新孕程，并参考既往数据优化评估。',
        doctorVisibleNotice: '医生端保留完整既往数据用于诊疗。',
        doctorCanSeeFullHistory: true,
        triggerLog: [
          {
            id: makeId('trigger'),
            channel: 'A',
            source: 'patient',
            detail: choice === 'fresh_start' ? '用户选择全新开始新孕程。' : '用户选择参考既往数据开始新孕程。',
            timestamp: Date.now()
          },
          ...state.triggerLog
        ]
      }
    })
}))
