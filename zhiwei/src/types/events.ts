import type { RiskLevel } from './signal'

export type AlertType = 'attention' | 'alert' | 'emergency'

export interface AlertEvent {
  id: string
  patientId: string
  level: RiskLevel
  createdAt: number
  summary: string
  acknowledged: boolean
}

export interface RiskAssessmentEvent {
  id: string
  patientId: string
  score: number
  riskLevel: RiskLevel
  measuredAt: number
}

export interface NotificationEvent {
  id: string
  type: 'reminder' | 'summary' | 'system'
  title: string
  body: string
  createdAt: number
  read: boolean
}
