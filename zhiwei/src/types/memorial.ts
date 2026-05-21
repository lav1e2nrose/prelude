export type AdverseOutcomeType =
  | 'early_miscarriage'
  | 'late_miscarriage'
  | 'iufd'
  | 'medical_termination'
  | 'selective_reduction'
  | 'neonatal_death'
  | 'unknown'
  | 'user_choice_other'

export type DataVisibility = 'hidden' | 'limited' | 'full'

export type AlertShutdownPolicy = 'immediate' | 'partial' | 'continued'

export interface DataRetentionPolicy {
  legalRetentionYears: number
  visibility: DataVisibility
  alertShutdown: AlertShutdownPolicy
  doctorArchiveStatus: 'ended' | 'ended_with_data' | 'research' | 'ongoing'
}

export interface MemorialModeState {
  enabled: boolean
  outcomeType: AdverseOutcomeType | null
  activatedAt: number | null
  activatedBy: 'patient' | 'guardian' | 'doctor' | 'system_auto' | null
  userNote: string | null
  dataRetention: DataRetentionPolicy
  canUndoUntil: number | null
  allowFutureReuse: boolean | null
}
