export interface GuardianMember {
  id: string
  name: string
  relationship: 'spouse' | 'parent' | 'parent_in_law' | 'sibling' | 'caregiver' | 'other'
  phoneNumber: string
  avatar?: string
  notificationConfig: {
    receivesAttention: boolean
    receivesAlert: boolean
    receivesEmergency: boolean
    quietHours?: { start: string; end: string }
    quietHoursOverrideForEmergency: boolean
  }
  permissions: {
    viewWaveform: boolean
    viewLocation: boolean
    viewHistoricalData: boolean
    receiveDailySummary: boolean
  }
  currentStatus: {
    isOnline: boolean
    lastActiveAt: number
    location?: { lat: number; lng: number; updatedAt: number }
    distanceToPatient?: number
  }
  isPrimaryContact: boolean
}

export interface OnCallSchedule {
  patientId: string
  shifts: OnCallShift[]
}

export interface OnCallShift {
  guardianId: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
}

export interface AlertResponse {
  alertId: string
  guardianId: string
  responseType: 'acknowledged' | 'en_route' | 'arrived' | 'cannot_respond' | 'delegated'
  message?: string
  timestamp: number
  estimatedArrivalMinutes?: number
}

export interface EscalationEvent {
  level: 'normal' | 'escalated_to_all' | 'escalated_to_doctor' | 'escalated_to_120'
  reason: string
  timestamp: number
}

export interface AlertCoordinationState {
  alertId: string
  notifiedGuardians: string[]
  acknowledgedGuardians: string[]
  enRouteGuardians: string[]
  cannotRespondGuardians: string[]
  primaryResponder: string | null
  escalationStatus: EscalationEvent['level']
  escalationTimeline: EscalationEvent[]
}
