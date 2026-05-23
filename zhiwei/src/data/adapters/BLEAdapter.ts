import type { IDataSource, ConnectionStatus } from '../IDataSource'
import type { EHGFrame } from '../../types/signal'

interface BLEAdapterConfig {
  deviceId?: string
  serviceUuid?: string
  characteristicUuid?: string
}

export class BLEAdapter implements IDataSource {
  readonly name = 'BLEAdapter'
  private _status: ConnectionStatus = 'disconnected'
  private frameHandlers = new Set<(frame: EHGFrame) => void>()
  private statusHandlers = new Set<(status: ConnectionStatus) => void>()
  private errorHandlers = new Set<(error: Error) => void>()
  private batteryHandlers = new Set<(level: number) => void>()
  private electrodeHandlers = new Set<(channel: number) => void>()
  private cleanupFrame: (() => void) | null = null
  private cleanupStatus: (() => void) | null = null
  private cleanupError: (() => void) | null = null

  async connect(config?: Record<string, unknown>): Promise<void> {
    const desktopDevices = window.zhiwei?.desktop?.devices
    if (!desktopDevices) {
      this.updateStatus('error')
      this.emitError(new Error('当前运行时未注入 BLE 桥接接口，请在 Electron 预加载层实现 devices API。'))
      return
    }

    const resolved = (config ?? {}) as BLEAdapterConfig
    this.updateStatus('pairing')

    this.cleanupFrame?.()
    this.cleanupStatus?.()
    this.cleanupError?.()

    this.cleanupFrame = desktopDevices.onBLEFrame((frame) => {
      this.frameHandlers.forEach((handler) => handler(frame))
      if (frame.batteryLevel < 25) this.batteryHandlers.forEach((handler) => handler(frame.batteryLevel))
      if (frame.electrodeQuality < 55) this.electrodeHandlers.forEach((handler) => handler(2))
    })
    this.cleanupStatus = desktopDevices.onBLEStatus((status) => {
      this.updateStatus(status)
    })
    this.cleanupError = desktopDevices.onBLEError((message) => {
      this.updateStatus('error')
      this.emitError(new Error(message))
    })

    await desktopDevices.connectBLE({
      deviceId: resolved.deviceId,
      serviceUuid: resolved.serviceUuid,
      characteristicUuid: resolved.characteristicUuid
    })
    this.updateStatus('connected')
  }

  async disconnect(): Promise<void> {
    const desktopDevices = window.zhiwei?.desktop?.devices
    if (desktopDevices) {
      await desktopDevices.disconnectBLE()
    }
    this.cleanupFrame?.()
    this.cleanupStatus?.()
    this.cleanupError?.()
    this.cleanupFrame = null
    this.cleanupStatus = null
    this.cleanupError = null
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

  private emitError(error: Error) {
    this.errorHandlers.forEach((handler) => handler(error))
  }
}
