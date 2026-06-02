import type {
  IRiskEngine,
  RiskEngineRequest,
  RiskEngineResponse,
  RiskEngineStatus
} from '../IRiskEngine'

// 生产风险引擎：对接算法团队实现的服务（WebSocket 流式 + REST 一次性）。
// 在算法端接入前，未配置 endpoint 时 status='unavailable'，evaluate 返回 unavailable，
// 界面如实显示"等待算法服务接入"，绝不编造风险分数。
//
// 接入方式（详见 docs/INTEGRATION.md）：
//   - REST:      POST {baseUrl}/v1/evaluate   body=RiskEngineRequest  → RiskEngineResponse
//   - WebSocket: {wsUrl}/v1/stream            送 RiskEngineRequest，收 RiskEngineResponse
//   - 鉴权:      Authorization: Bearer <token>

export interface RemoteRiskEngineConfig {
  baseUrl: string // 如 https://algo.zhiwei.health
  token: string
  timeoutMs: number
}

export class RemoteRiskEngine implements IRiskEngine {
  readonly mode = 'remote' as const
  private _status: RiskEngineStatus
  private statusHandlers = new Set<(s: RiskEngineStatus) => void>()
  private readonly config: RemoteRiskEngineConfig

  constructor(config: Partial<RemoteRiskEngineConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? '',
      token: config.token ?? '',
      timeoutMs: config.timeoutMs ?? 3000
    }
    // 未配置算法服务地址 → 视为尚未接入
    this._status = this.config.baseUrl ? 'connecting' : 'unavailable'
  }

  get status(): RiskEngineStatus {
    return this._status
  }

  onStatusChange(cb: (s: RiskEngineStatus) => void): () => void {
    this.statusHandlers.add(cb)
    cb(this._status)
    return () => this.statusHandlers.delete(cb)
  }

  private setStatus(status: RiskEngineStatus) {
    if (this._status === status) return
    this._status = status
    this.statusHandlers.forEach((cb) => cb(status))
  }

  async evaluate(req: RiskEngineRequest): Promise<RiskEngineResponse> {
    if (!this.config.baseUrl) {
      return { ok: false, reason: 'unavailable', message: '算法服务尚未接入' }
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs)
    try {
      const res = await fetch(`${this.config.baseUrl}/v1/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {})
        },
        body: JSON.stringify(req),
        signal: controller.signal
      })
      if (res.status === 401 || res.status === 403) {
        this.setStatus('unavailable')
        return { ok: false, reason: 'auth', message: '算法服务鉴权失败' }
      }
      if (!res.ok) {
        return { ok: false, reason: 'model_error', message: `算法服务返回 ${res.status}` }
      }
      const data = (await res.json()) as RiskEngineResponse
      this.setStatus('ready')
      return data
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError'
      this.setStatus('unavailable')
      return {
        ok: false,
        reason: aborted ? 'timeout' : 'unavailable',
        message: aborted ? '算法服务响应超时' : '无法连接算法服务'
      }
    } finally {
      clearTimeout(timer)
    }
  }

  dispose(): void {
    this.statusHandlers.clear()
  }
}
