import { create } from 'zustand'
import type { AlertCoordinationState, GuardianMember, OnCallSchedule } from '../types/collaboration'

interface CollaborationStore {
  guardians: GuardianMember[]
  schedule: OnCallSchedule
  coordination: AlertCoordinationState
}

const guardians: GuardianMember[] = [
  {
    id: 'guardian-chen',
    name: '陈先生',
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
    id: 'guardian-wang',
    name: '王女士',
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
  }
]

export const useCollaborationStore = create<CollaborationStore>(() => ({
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
  }
}))
