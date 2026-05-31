import type { EHGFrame } from '../types/signal'

// 设备侧数据源契约。真实实现（BLE/串口/网关）与 Mock 实现共用此契约，
// 仅靠设置切换；连接状态严格走状态机，禁止默认"已连接"。

export type ConnectionStatus =
  | 'idle' // 未开始
  | 'scanning' // 正在扫描设备
  | 'pairing' // 正在配对/建立连接
  | 'connected' // 已连接并在接收数据
  | 'reconnecting' // 连接中断，自动重连中
  | 'error' // 出错（见 lastError）
  | 'mock' // 开发模式：Mock 数据源（全局须有开发标识）

export interface DeviceInfo {
  deviceId: string
  model: string
  firmware: string
  rssi?: number
}

export type DeviceControlCommand =
  | { type: 'recalibrate' }
  | { type: 'set_sample_rate'; hz: number }
  | { type: 'identify' }

export interface DeviceError {
  code: string
  message: string
  recoverable: boolean
}

export interface IDataSource {
  readonly kind: 'ble' | 'serial' | 'websocket' | 'mock'
  readonly status: ConnectionStatus
  /** 真实扫描可用设备（mock 返回固定列表） */
  scan(): Promise<DeviceInfo[]>
  connect(deviceId?: string, config?: Record<string, unknown>): Promise<void>
  disconnect(): Promise<void>
  /** 校准/重置电极基线 / 设采样率等控制指令 */
  sendControl(cmd: DeviceControlCommand): Promise<void>
  onFrame(callback: (frame: EHGFrame) => void): () => void
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void
  onError(callback: (error: DeviceError) => void): () => void
  onBatteryLow(callback: (level: number) => void): () => void
  onElectrodeLoose(callback: (channel: number) => void): () => void
}
