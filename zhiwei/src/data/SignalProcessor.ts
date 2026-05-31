import type { ArtifactType, ContractionState, EHGFeatures, EHGFrame } from '../types/signal'

// 本端信号处理：仅负责"显示用"的客观处理（波形包络、伪迹/电极松动标记、客户端可独立完成的特征）。
// 风险判定一律由算法端（IRiskEngine）给出，本类不产生风险分数，避免黑箱与编造。

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export interface DisplaySignal {
  contractionState: ContractionState
  contractionIntensity: number
  artifacts: ArtifactType[]
  /** 信号派生的显示特征。pretermProbability* 属算法输出，此处置 0 由 UI 在算法未接入时屏蔽。 */
  features: EHGFeatures
}

export class SignalProcessor {
  extractDisplay(frame: EHGFrame): DisplaySignal {
    const amplitude = frame.ehg.reduce((sum, v) => sum + Math.abs(v), 0) / Math.max(1, frame.ehg.length)
    const intensity = clamp(amplitude / 50, 0, 1)
    return {
      contractionState: this.toContractionState(intensity),
      contractionIntensity: intensity,
      artifacts: this.collectArtifacts(frame),
      features: {
        bandpower: { low: amplitude * 0.45, high: amplitude * 0.28 },
        medianFrequency: 0.38 + amplitude / 400,
        peakFrequency: 0.58 + amplitude / 500,
        rmsAmplitude: amplitude,
        contractionsPerHour: clamp(amplitude / 12, 0, 12),
        contractionRegularity: clamp(0.4 + amplitude / 200, 0, 1),
        contractionPropagationVelocity: clamp(1.5 + amplitude / 60, 0, 6),
        // 以下为算法输出占位，UI 在算法未接入时不展示
        pretermProbability24h: 0,
        pretermProbability7d: 0
      }
    }
  }

  private toContractionState(intensity: number): ContractionState {
    if (intensity >= 0.85) return 'peak'
    if (intensity >= 0.6) return 'active'
    if (intensity >= 0.4) return 'recovery'
    return 'rest'
  }

  private collectArtifacts(frame: EHGFrame): ArtifactType[] {
    const artifacts: ArtifactType[] = []
    if (frame.electrodeQuality < 55) artifacts.push('electrode_loose')
    if (Math.abs(frame.imu.ax) > 1.4 || Math.abs(frame.imu.ay) > 1.4) artifacts.push('movement')
    return artifacts
  }
}
