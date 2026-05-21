import type {
  ArtifactType,
  ContractionState,
  EHGFeatures,
  EHGFrame,
  ProcessedFrame,
  RiskLevel
} from '../types/signal'
import { ExplainabilityEngine } from './ExplainabilityEngine'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export class SignalProcessor {
  private readonly explainabilityEngine: ExplainabilityEngine

  constructor(explainabilityEngine: ExplainabilityEngine = new ExplainabilityEngine()) {
    this.explainabilityEngine = explainabilityEngine
  }

  processFrame(frame: EHGFrame): ProcessedFrame {
    const amplitude = frame.ehg.reduce((sum, value) => sum + Math.abs(value), 0) / frame.ehg.length
    const pretermRiskScore = clamp(0.3 + amplitude / 120 + frame.maternalHR / 240, 0, 1)
    const riskLevel = this.toRiskLevel(pretermRiskScore)
    const contractionState = this.toContractionState(pretermRiskScore)

    return {
      ...frame,
      contractionState,
      contractionIntensity: clamp(amplitude / 20, 0, 1),
      pretermRiskScore,
      pretermRiskExplanation: this.explainabilityEngine.generateExplanation(frame),
      riskLevel,
      artifacts: this.collectArtifacts(frame),
      features: this.toFeatures(amplitude)
    }
  }

  private toRiskLevel(score: number): RiskLevel {
    if (score >= 0.85) return 'emergency'
    if (score >= 0.7) return 'alert'
    if (score >= 0.5) return 'attention'
    return 'safe'
  }

  private toContractionState(score: number): ContractionState {
    if (score >= 0.85) return 'peak'
    if (score >= 0.65) return 'active'
    if (score >= 0.5) return 'recovery'
    return 'rest'
  }

  private collectArtifacts(frame: EHGFrame): ArtifactType[] {
    const artifacts: ArtifactType[] = []
    if (frame.electrodeQuality < 55) artifacts.push('electrode_loose')
    if (Math.abs(frame.imu.ax) > 1.4 || Math.abs(frame.imu.ay) > 1.4) artifacts.push('movement')
    return artifacts
  }

  private toFeatures(amplitude: number): EHGFeatures {
    return {
      bandpower: { low: amplitude * 0.45, high: amplitude * 0.28 },
      medianFrequency: 0.42,
      peakFrequency: 0.6,
      rmsAmplitude: amplitude,
      contractionsPerHour: 3.2,
      contractionRegularity: 0.72,
      contractionPropagationVelocity: 0.58,
      pretermProbability24h: 0.22,
      pretermProbability7d: 0.46
    }
  }
}
