export interface EHGFrame {
  timestamp: number
  ehg: number[]
  fetalHR?: number
  maternalHR: number
  fetalMovement?: 0 | 1
  imu: {
    ax: number
    ay: number
    az: number
    gx: number
    gy: number
    gz: number
  }
  electrodeQuality: number
  batteryLevel: number
  posture: 'standing' | 'sitting' | 'lying_left' | 'lying_right' | 'lying_back' | 'unknown'
}

export interface ProcessedFrame extends EHGFrame {
  contractionState: ContractionState
  contractionIntensity: number
  pretermRiskScore: number
  pretermRiskExplanation: RiskExplanation
  riskLevel: RiskLevel
  artifacts: ArtifactType[]
  features: EHGFeatures
}

export interface RiskExplanation {
  modelVersion: string
  confidence: number
  confidenceInterval: [number, number]
  featureContributions: FeatureContribution[]
  oodScore: number
  similarPatients: SimilarPatient[]
  counterfactuals: Counterfactual[]
  knownLimitations: string[]
}

export type FeatureName =
  | 'contractionsPerHour'
  | 'medianFrequency'
  | 'peakFrequency'
  | 'rmsAmplitude'
  | 'contractionRegularity'
  | 'contractionPropagationVelocity'
  | 'bandpowerLow'
  | 'bandpowerHigh'
  | 'pretermProbability24h'
  | 'pretermProbability7d'
  | 'gestationalWeek'
  | 'cervicalLength'
  | 'fetalMovementCount6h'
  | 'maternalHeartRate'
  | 'previousPretermHistory'
  | 'multiplePregnancy'
  | 'ivfPregnancy'

export interface FeatureContribution {
  featureName: FeatureName
  displayName: string
  currentValue: number
  baselineValue: number
  contribution: number
  unit: string
}

export interface SimilarPatient {
  anonymizedId: string
  similarityScore: number
  gestationalWeekAtMeasurement: number
  actualOutcome: 'term_delivery' | 'preterm_24h' | 'preterm_7d' | 'preterm_28d' | 'unknown'
  outcomeNote?: string
}

export interface Counterfactual {
  scenario: string
  conditionChanges: Record<string, number>
  resultingRiskScore: number
  resultingRiskChange: number
  actionability: 'modifiable' | 'fixed'
}

export type ContractionState = 'rest' | 'active' | 'peak' | 'recovery'

export type RiskLevel = 'safe' | 'attention' | 'alert' | 'emergency'

export type ArtifactType = 'movement' | 'electrode_loose' | 'power_line' | 'maternal_breathing'

export interface EHGFeatures {
  bandpower: { low: number; high: number }
  medianFrequency: number
  peakFrequency: number
  rmsAmplitude: number
  contractionsPerHour: number
  contractionRegularity: number
  contractionPropagationVelocity: number
  pretermProbability24h: number
  pretermProbability7d: number
}

export interface ContractionEvent {
  id: string
  startTime: number
  endTime: number
  peakTime: number
  peakIntensity: number
  durationSec: number
  source: 'algorithm' | 'manual'
  userValidation?: 'confirmed' | 'false_positive' | 'unsure'
  doctorOverride?: DoctorOverride
}

export interface DoctorOverride {
  doctorId: string
  overrideAction: 'confirm_algorithm' | 'reject_algorithm' | 'modify_boundaries'
  clinicalReasoning: string
  timestamp: number
}

export interface FetalMovementEvent {
  id: string
  timestamp: number
  source: 'algorithm' | 'manual'
  cluster?: string
}
