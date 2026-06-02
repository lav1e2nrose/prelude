import type {
  IRiskEngine,
  RiskAssessment,
  RiskEngineRequest,
  RiskEngineResponse,
  RiskEngineStatus
} from '../IRiskEngine'
import type { ContractionState, EHGFeatures, RiskLevel } from '../../types/signal'
import { ExplainabilityEngine } from '../ExplainabilityEngine'

// 开发期 Mock 风险引擎（DEV ONLY）：本地由窗口特征生成风险评估，用于无算法端时的联调与回归测试。
// 仅在 settings.dev.useMockRiskEngine 开启时启用，开启时全局显示 DevModeBanner。

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const toRiskLevel = (score: number): RiskLevel => {
  if (score >= 85) return 'emergency'
  if (score >= 70) return 'alert'
  if (score >= 50) return 'attention'
  return 'safe'
}

const toContractionState = (score: number): ContractionState => {
  if (score >= 85) return 'peak'
  if (score >= 65) return 'active'
  if (score >= 50) return 'recovery'
  return 'rest'
}

export class MockRiskEngine implements IRiskEngine {
  readonly mode = 'mock' as const
  private _status: RiskEngineStatus = 'ready'
  private statusHandlers = new Set<(s: RiskEngineStatus) => void>()
  private readonly explainability = new ExplainabilityEngine()

  get status(): RiskEngineStatus {
    return this._status
  }

  onStatusChange(cb: (s: RiskEngineStatus) => void): () => void {
    this.statusHandlers.add(cb)
    cb(this._status)
    return () => this.statusHandlers.delete(cb)
  }

  async evaluate(req: RiskEngineRequest): Promise<RiskEngineResponse> {
    const last = req.window.at(-1)
    if (!last) {
      return { ok: false, reason: 'bad_request', message: '窗口为空' }
    }

    // 由窗口幅度 + 母体心率 + 孕龄因素粗略合成一个风险分（仅演示，非临床）
    const amplitude =
      last.ehg.reduce((sum, v) => sum + Math.abs(v), 0) / Math.max(1, last.ehg.length)
    const gestationWeeks = req.gestationalAgeDays / 7
    const earlyFactor = gestationWeeks < 34 ? (34 - gestationWeeks) * 1.5 : 0
    const score = clamp(
      18 + amplitude * 0.9 + Math.max(0, last.maternalHR - 80) * 0.6 + earlyFactor + req.riskFactors.length * 2,
      0,
      100
    )

    const features: EHGFeatures = {
      bandpower: { low: amplitude * 0.45, high: amplitude * 0.28 },
      medianFrequency: 0.38 + amplitude / 400,
      peakFrequency: 0.58 + amplitude / 500,
      rmsAmplitude: amplitude,
      contractionsPerHour: clamp(amplitude / 12, 0, 12),
      contractionRegularity: clamp(0.4 + amplitude / 200, 0, 1),
      contractionPropagationVelocity: clamp(1.5 + amplitude / 60, 0, 6),
      pretermProbability24h: clamp(score / 100 / 3, 0, 1),
      pretermProbability7d: clamp(score / 100, 0, 1)
    }

    const assessment: RiskAssessment = {
      pretermRiskScore: score,
      riskLevel: toRiskLevel(score),
      contractionState: toContractionState(score),
      contractionIntensity: clamp(amplitude / 50, 0, 1),
      features,
      explanation: this.explainability.generateExplanation(last)
    }
    return { ok: true, assessment }
  }

  dispose(): void {
    this.statusHandlers.clear()
  }
}
