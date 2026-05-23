import type { IDataSource, ConnectionStatus } from '../IDataSource'
import type { EHGFrame } from '../../types/signal'

interface WebSocketAdapterConfig {
  url?: string
  protocols?: string | string[]
  authToken?: string
  reconnectIntervalMs?: number
  maxReconnectAttempts?: number
}

const defaultConfig: Required<Pick<WebSocketAdapterConfig, 'url' | 'reconnectIntervalMs' | 'maxReconnectAttempts'>> = {
  url: 'ws://127.0.0.1:8787/stream',
  reconnectIntervalMs: 2500,
  maxReconnectAttempts: 8
}

export class WebSocketAdapter implements IDataSource {
  readonly name = 'WebSocketAdapter'
  private _status: ConnectionStatus = 'disconnected'
  private frameHandlers = new Set<(frame: EHGFrame) => void>()
  private statusHandlers = new Set<(status: ConnectionStatus) => void>()
  private errorHandlers = new Set<(error: Error) => void>()
  private batteryHandlers = new Set<(level: number) => void>()
  private electrodeHandlers = new Set<(channel: number) => void>()
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private config: WebSocketAdapterConfig = defaultConfig
  private manualDisconnect = false

  async connect(config?: Record<string, unknown>): Promise<void> {
    this.config = this.parseConfig(config)
    this.manualDisconnect = false
    this.clearReconnectTimer()
    await this.openSocket()
  }

  async disconnect(): Promise<void> {
    this.manualDisconnect = true
    this.clearReconnectTimer()
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
    this.updateStatus('disconnected')
  }

  onFrame(callback: (frame: EHGFrame) => void): () => void {
    this.frameHandlers.add(callback)
    return () => this.frameHandlers.delete(callback)
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(callback)
    return () => this.statusHandlers.delete(callback)
  }

  onError(callback: (error: Error) => void): () => void {
    this.errorHandlers.add(callback)
    return () => this.errorHandlers.delete(callback)
  }

  onBatteryLow(callback: (level: number) => void): () => void {
    this.batteryHandlers.add(callback)
    return () => this.batteryHandlers.delete(callback)
  }

  onElectrodeLoose(callback: (channel: number) => void): () => void {
    this.electrodeHandlers.add(callback)
    return () => this.electrodeHandlers.delete(callback)
  }

  get status(): ConnectionStatus {
    return this._status
  }

  private updateStatus(status: ConnectionStatus) {
    this._status = status
    this.statusHandlers.forEach((handler) => handler(status))
  }

  private parseConfig(config?: Record<string, unknown>): WebSocketAdapterConfig {
    const input = (config ?? {}) as WebSocketAdapterConfig
    const reconnectIntervalMs =
      typeof input.reconnectIntervalMs === 'number' && Number.isFinite(input.reconnectIntervalMs)
        ? Math.max(500, input.reconnectIntervalMs)
        : defaultConfig.reconnectIntervalMs
    const maxReconnectAttempts =
      typeof input.maxReconnectAttempts === 'number' && Number.isFinite(input.maxReconnectAttempts)
        ? Math.max(0, Math.floor(input.maxReconnectAttempts))
        : defaultConfig.maxReconnectAttempts

    return {
      url: typeof input.url === 'string' && input.url.trim().length > 0 ? input.url.trim() : defaultConfig.url,
      protocols: input.protocols,
      authToken: typeof input.authToken === 'string' && input.authToken.length > 0 ? input.authToken : undefined,
      reconnectIntervalMs,
      maxReconnectAttempts
    }
  }

  private async openSocket(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.updateStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'pairing')
    const socketUrl = this.buildSocketUrl(this.config.url ?? defaultConfig.url, this.config.authToken)
    const ws = new WebSocket(socketUrl, this.config.protocols)
    this.ws = ws

    ws.onopen = () => {
      this.reconnectAttempts = 0
      this.updateStatus('connected')
    }

    ws.onmessage = (event: MessageEvent<string>) => {
      const frame = this.parseFrame(event.data)
      if (!frame) return
      this.frameHandlers.forEach((handler) => handler(frame))
      if (frame.batteryLevel < 25) this.batteryHandlers.forEach((handler) => handler(frame.batteryLevel))
      if (frame.electrodeQuality < 55) this.electrodeHandlers.forEach((handler) => handler(2))
    }

    ws.onerror = () => {
      this.emitError(new Error('WebSocket 连接发生错误，请检查服务端地址与网络。'))
    }

    ws.onclose = () => {
      this.ws = null
      if (this.manualDisconnect) {
        this.updateStatus('disconnected')
        return
      }
      this.tryReconnect()
    }
  }

  private buildSocketUrl(url: string, authToken?: string): string {
    if (!authToken) return url
    const parsed = new URL(url)
    parsed.searchParams.set('token', authToken)
    return parsed.toString()
  }

  private parseFrame(raw: string): EHGFrame | null {
    try {
      const frame = JSON.parse(raw) as Partial<EHGFrame>
      if (!this.isFrame(frame)) {
        this.emitError(new Error('收到无效帧结构，已忽略。'))
        return null
      }
      return frame
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error('解析实时帧失败'))
      return null
    }
  }

  private isFrame(frame: Partial<EHGFrame>): frame is EHGFrame {
    return (
      typeof frame.timestamp === 'number' &&
      Array.isArray(frame.ehg) &&
      frame.ehg.length > 0 &&
      typeof frame.maternalHR === 'number' &&
      typeof frame.electrodeQuality === 'number' &&
      typeof frame.batteryLevel === 'number' &&
      typeof frame.posture === 'string' &&
      Boolean(frame.imu)
    )
  }

  private tryReconnect() {
    const maxAttempts = this.config.maxReconnectAttempts ?? defaultConfig.maxReconnectAttempts
    if (this.reconnectAttempts >= maxAttempts) {
      this.updateStatus('error')
      this.emitError(new Error('WebSocket 重连次数已达上限。'))
      return
    }

    this.reconnectAttempts += 1
    this.updateStatus('reconnecting')
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      void this.openSocket()
    }, this.config.reconnectIntervalMs ?? defaultConfig.reconnectIntervalMs)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private emitError(error: Error) {
    this.errorHandlers.forEach((handler) => handler(error))
  }
}
