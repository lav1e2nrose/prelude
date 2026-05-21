import type { EHGFrame } from '../types/signal'

export type ConnectionStatus =
  | 'disconnected'
  | 'pairing'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'mock'

export interface IDataSource {
  readonly name: string
  readonly status: ConnectionStatus
  connect(config?: Record<string, unknown>): Promise<void>
  disconnect(): Promise<void>
  onFrame(callback: (frame: EHGFrame) => void): () => void
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void
  onError(callback: (error: Error) => void): () => void
  onBatteryLow(callback: (level: number) => void): () => void
  onElectrodeLoose(callback: (channel: number) => void): () => void
}
