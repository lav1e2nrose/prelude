import type {
  ConnectionStatus,
  DeviceControlCommand,
  DeviceError,
  DeviceInfo,
  IDataSource
} from '../IDataSource'
import type { EHGFrame } from '../../types/signal'

interface BLEAdapterConfig {
  deviceId?: string
  serviceUuid?: string
  characteristicUuid?: string
}

// 生产默认数据源。经 Electron 预加载层注入的 devices 桥真实扫描/连接/订阅 BLE。
// 运行时未注入桥接（如纯浏览器预览）时进入真实的 error 状态，不静默回退到 Mock。
export class BLEAdapter implements IDataSource {
  readonly kind = 'ble' as const
  private _status: ConnectionStatus = 'idle'
  private frameHandlers = new Set<(frame: EHGFrame) => void>()
  private statusHandlers = new Set<(status: ConnectionStatus) => void>()
  private errorHandlers = new Set<(error: DeviceError) => void>()
  private batteryHandlers = new Set<(level: number) => void>()
  private electrodeHandlers = new Set<(channel: number) => void>()
  private cleanupFrame: (() => void) | null = null
  private cleanupStatus: (() => void) | null = null
  private cleanupError: (() => void) | null = null

  async scan(): Promise<DeviceInfo[]> {
    const bridge = window.zhiwei?.desktop?.devices
    if (!bridge?.scanBLE) {
      this.updateStatus('idle')
      return []
    }
    this.updateStatus('scanning')
    try {
      const devices = await bridge.scanBLE()
      this.updateStatus('idle')
      return devices
    } catch (error) {
      this.updateStatus('error')
      this.emitError({ code: 'scan_failed', message: error instanceof Error ? error.message : '扫描设备失败', recoverable: true })
      return []
    }
  }

  async connect(deviceId?: string, config?: Record<string, unknown>): Promise<void> {
    const bridge = window.zhiwei?.desktop?.devices
    if (!bridge) {
      this.updateStatus('error')
      this.emitError({
        code: 'bridge_missing',
        message: '当前运行时未注入 BLE 桥接接口，请在 Electron 预加载层实现 devices API（见 docs/INTEGRATION.md）。',
        recoverable: false
      })
      return
    }

    const resolved = (config ?? {}) as BLEAdapterConfig
    this.updateStatus('pairing')
    this.cleanupFrame?.()
    this.cleanupStatus?.()
    this.cleanupError?.()

    this.cleanupFrame = bridge.onBLEFrame((frame) => {
      this.frameHandlers.forEach((handler) => handler(frame))
      if (frame.batteryLevel < 25) this.batteryHandlers.forEach((handler) => handler(frame.batteryLevel))
      if (frame.electrodeQuality < 55) this.electrodeHandlers.forEach((handler) => handler(2))
    })
    this.cleanupStatus = bridge.onBLEStatus((status) => this.updateStatus(status))
    this.cleanupError = bridge.onBLEError((message) => {
      this.updateStatus('error')
      this.emitError({ code: 'ble_error', message, recoverable: true })
    })

    await bridge.connectBLE({
      deviceId: deviceId ?? resolved.deviceId,
      serviceUuid: resolved.serviceUuid,
      characteristicUuid: resolved.characteristicUuid
    })
    this.updateStatus('connected')
  }

  async disconnect(): Promise<void> {
    const bridge = window.zhiwei?.desktop?.devices
    if (bridge) await bridge.disconnectBLE()
    this.cleanupFrame?.()
    this.cleanupStatus?.()
    this.cleanupError?.()
    this.cleanupFrame = null
    this.cleanupStatus = null
    this.cleanupError = null
    this.updateStatus('idle')
  }

  async sendControl(cmd: DeviceControlCommand): Promise<void> {
    const bridge = window.zhiwei?.desktop?.devices
    if (bridge?.sendBLEControl) await bridge.sendBLEControl(cmd)
  }

  onFrame(callback: (frame: EHGFrame) => void): () => void {
    this.frameHandlers.add(callback)
    return () => this.frameHandlers.delete(callback)
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(callback)
    return () => this.statusHandlers.delete(callback)
  }

  onError(callback: (error: DeviceError) => void): () => void {
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

  private emitError(error: DeviceError) {
    this.errorHandlers.forEach((handler) => handler(error))
  }
}
