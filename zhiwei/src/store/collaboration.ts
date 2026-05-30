import { create } from 'zustand'
import type { AlertCoordinationState, GuardianMember, OnCallSchedule } from '../types/collaboration'

interface CollaborationStore {
  guardians: GuardianMember[]
  schedule: OnCallSchedule
  coordination: AlertCoordinationState
  acknowledgeByGuardian: (guardianId: string) => void
  setGuardianEnRoute: (guardianId: string) => void
  markCannotRespond: (guardianId: string) => void
  escalate: (level: AlertCoordinationState['escalationStatus'], reason: string) => void
}

const guardians: GuardianMember[] = [
  {
    id: 'guardian-chen',
    name: '陈先生（丈夫）',
    relationship: 'spouse',
    phoneNumber: '138****2468',
    notificationConfig: {
      receivesAttention: true,
      receivesAlert: true,
      receivesEmergency: true,
      quietHoursOverrideForEmergency: true
    },
    permissions: {
      viewWaveform: true,
      viewLocation: true,
      viewHistoricalData: true,
      receiveDailySummary: true
    },
    currentStatus: {
      isOnline: true,
      lastActiveAt: Date.now() - 1000 * 60 * 3,
      distanceToPatient: 1200
    },
    isPrimaryContact: true
  },
  {
    id: 'guardian-wang-mum',
    name: '王女士（婆婆）',
    relationship: 'parent_in_law',
    phoneNumber: '139****1993',
    notificationConfig: {
      receivesAttention: true,
      receivesAlert: true,
      receivesEmergency: true,
      quietHoursOverrideForEmergency: true
    },
    permissions: {
      viewWaveform: false,
      viewLocation: true,
      viewHistoricalData: true,
      receiveDailySummary: false
    },
    currentStatus: {
      isOnline: true,
      lastActiveAt: Date.now() - 1000 * 60 * 12,
      distanceToPatient: 200
    },
    isPrimaryContact: false
  },
  {
    id: 'guardian-liu',
    name: '刘女士（妈妈）',
    relationship: 'parent',
    phoneNumber: '136****8821',
    notificationConfig: {
      receivesAttention: false,
      receivesAlert: false,
      receivesEmergency: true,
      quietHoursOverrideForEmergency: true
    },
    permissions: {
      viewWaveform: false,
      viewLocation: false,
      viewHistoricalData: false,
      receiveDailySummary: false
    },
    currentStatus: {
      isOnline: false,
      lastActiveAt: Date.now() - 1000 * 60 * 60 * 4,
      distanceToPatient: 1800000
    },
    isPrimaryContact: false
  },
  {
    id: 'guardian-li',
    name: '李护士（月嫂）',
    relationship: 'caregiver',
    phoneNumber: '135****4410',
    notificationConfig: {
      receivesAttention: false,
      receivesAlert: false,
      receivesEmergency: true,
      quietHoursOverrideForEmergency: false
    },
    permissions: {
      viewWaveform: false,
      viewLocation: true,
      viewHistoricalData: false,
      receiveDailySummary: false
    },
    currentStatus: {
      isOnline: true,
      lastActiveAt: Date.now() - 1000 * 60 * 5,
      distanceToPatient: 50
    },
    isPrimaryContact: false
  },
  {
    id: 'guardian-chen-dad',
    name: '陈父（公公）',
    relationship: 'parent_in_law',
    phoneNumber: '137****3302',
    notificationConfig: {
      receivesAttention: false,
      receivesAlert: false,
      receivesEmergency: true,
      quietHoursOverrideForEmergency: true
    },
    permissions: {
      viewWaveform: false,
      viewLocation: false,
      viewHistoricalData: false,
      receiveDailySummary: true
    },
    currentStatus: {
      isOnline: false,
      lastActiveAt: Date.now() - 1000 * 60 * 60 * 2,
      distanceToPatient: 8000
    },
    isPrimaryContact: false
  }
]

export const useCollaborationStore = create<CollaborationStore>((set) => ({
  guardians,
  schedule: {
    patientId: 'patient-001',
    shifts: [
      { guardianId: 'guardian-chen', startTime: '08:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
      { guardianId: 'guardian-wang', startTime: '18:00', endTime: '23:00', daysOfWeek: [1, 2, 3, 4, 5, 6, 0] }
    ]
  },
  coordination: {
    alertId: 'alert-002',
    notifiedGuardians: ['guardian-chen', 'guardian-wang'],
    acknowledgedGuardians: ['guardian-chen'],
    enRouteGuardians: ['guardian-chen'],
    cannotRespondGuardians: [],
    primaryResponder: 'guardian-chen',
    escalationStatus: 'normal',
    escalationTimeline: [
      {
        level: 'normal',
        reason: 'alert 触发后自动通知第一联系人',
        timestamp: Date.now() - 1000 * 60 * 4
      }
    ]
  },
  acknowledgeByGuardian: (guardianId) =>
    set((state) => ({
      coordination: {
        ...state.coordination,
        acknowledgedGuardians: Array.from(
          new Set([...state.coordination.acknowledgedGuardians, guardianId])
        )
      }
    })),
  setGuardianEnRoute: (guardianId) =>
    set((state) => ({
      coordination: {
        ...state.coordination,
        primaryResponder: guardianId,
        enRouteGuardians: Array.from(new Set([...state.coordination.enRouteGuardians, guardianId])),
        acknowledgedGuardians: Array.from(
          new Set([...state.coordination.acknowledgedGuardians, guardianId])
        )
      }
    })),
  markCannotRespond: (guardianId) =>
    set((state) => ({
      coordination: {
        ...state.coordination,
        cannotRespondGuardians: Array.from(
          new Set([...state.coordination.cannotRespondGuardians, guardianId])
        )
      }
    })),
  escalate: (level, reason) =>
    set((state) => ({
      coordination: {
        ...state.coordination,
        escalationStatus: level,
        escalationTimeline: [
          ...state.coordination.escalationTimeline,
          {
            level,
            reason,
            timestamp: Date.now()
          }
        ]
      }
    }))
}))
