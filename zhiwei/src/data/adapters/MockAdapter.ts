import type { IDataSource, ConnectionStatus } from '../IDataSource'
import type { EHGFrame } from '../../types/signal'

const createFrame = (): EHGFrame => {
  const base = 20 + Math.random() * 10
  return {
    timestamp: Date.now(),
    ehg: Array.from({ length: 4 }, () => base + Math.random() * 6),
    fetalHR: 138 + Math.round(Math.random() * 6),
    maternalHR: 78 + Math.round(Math.random() * 12),
    fetalMovement: Math.random() > 0.7 ? 1 : 0,
    imu: {
      ax: Math.random() * 0.4,
      ay: Math.random() * 0.4,
      az: 1 + Math.random() * 0.1,
      gx: Math.random() * 0.05,
      gy: Math.random() * 0.05,
      gz: Math.random() * 0.05
    },
    electrodeQuality: 72 + Math.round(Math.random() * 18),
    batteryLevel: 52 + Math.round(Math.random() * 40),
    posture: 'lying_left'
  }
}

export class MockAdapter implements IDataSource {
  readonly name = 'MockAdapter'
  private _status: ConnectionStatus = 'disconnected'
  private timer: ReturnType<typeof setInterval> | null = null
  private frameHandlers = new Set<(frame: EHGFrame) => void>()
  private statusHandlers = new Set<(status: ConnectionStatus) => void>()
  private errorHandlers = new Set<(error: Error) => void>()
  private batteryHandlers = new Set<(level: number) => void>()
  private electrodeHandlers = new Set<(channel: number) => void>()

  async connect(): Promise<void> {
    this.updateStatus('mock')
    this.timer = setInterval(() => {
      const frame = createFrame()
      this.frameHandlers.forEach((handler) => handler(frame))
      if (frame.batteryLevel < 25) this.batteryHandlers.forEach((handler) => handler(frame.batteryLevel))
      if (frame.electrodeQuality < 55) this.electrodeHandlers.forEach((handler) => handler(2))
    }, 1000)
  }

  async disconnect(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
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

}
