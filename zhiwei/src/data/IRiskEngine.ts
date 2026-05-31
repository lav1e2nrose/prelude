import type { EHGFeatures, EHGFrame, RiskExplanation, RiskLevel, ContractionState } from '../types/signal'
import type { RiskFactorCode } from '../types/user'

// 算法服务契约（交给算法团队的对接点）。本端不实现风险算法：把缓冲窗口送出，拿回风险评估。
// 算法端只需实现满足本契约的服务（WebSocket 流式 / REST 一次性），无需改前端业务代码。

export interface RiskEngineRequest {
  schemaVersion: 1
  patientId: string
  gestationalAgeDays: number
  riskFactors: RiskFactorCode[]
  /** 最近 N 秒原始帧窗口（如 60s @ 20Hz） */
  window: EHGFrame[]
}

/** 算法端对一个窗口的风险评估输出（与设备帧合并为 ProcessedFrame 由本端完成） */
export interface RiskAssessment {
  pretermRiskScore: number // 0-100
  riskLevel: RiskLevel
  contractionState: ContractionState
  contractionIntensity: number
  features: EHGFeatures
  explanation: RiskExplanation
}

export type RiskEngineFailureReason = 'unavailable' | 'auth' | 'bad_request' | 'timeout' | 'model_error'

export type RiskEngineResponse =
  | { ok: true; assessment: RiskAssessment }
  | { ok: false; reason: RiskEngineFailureReason; message: string }

export type RiskEngineStatus = 'unavailable' | 'connecting' | 'ready'

export interface IRiskEngine {
  readonly mode: 'remote' | 'mock'
  readonly status: RiskEngineStatus
  onStatusChange(cb: (status: RiskEngineStatus) => void): () => void
  evaluate(req: RiskEngineRequest): Promise<RiskEngineResponse>
  dispose(): void
}
