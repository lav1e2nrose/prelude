export interface EHGFrame {
  /** 帧结构版本（前后兼容）。详见 docs/INTEGRATION.md */
  schemaVersion?: number
  /** 设备序列号（来自设备信息特征） */
  deviceId?: string
  /** 单调递增帧序号，用于丢包检测 */
  seq?: number
  /** 采样率 Hz（如 20） */
  sampleRateHz?: number
  timestamp: number
  /** 四导联 EHG 原始值（μV） */
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
  /** 综合电极贴合质量 0-100（每导联明细见 electrodeChannels） */
  electrodeQuality: number
  /** 每导联电极贴合质量 0-100（可选；二进制帧拆包后填充） */
  electrodeChannels?: number[]
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
