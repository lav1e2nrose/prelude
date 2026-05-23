import type { IDataSource, ConnectionStatus } from '../IDataSource'
import type { EHGFrame } from '../../types/signal'

interface MockAdapterConfig {
  scenario?: string
  intervalMs?: number
}

interface ScenarioProfile {
  amplitude: number
  variability: number
  maternalBase: number
  fetalBase: number
  electrodeQuality: number
  batteryLevel: number
  movementChance: number
  posture: EHGFrame['posture']
}

const defaultIntervalMs = 1000

const scenarioProfiles: Record<string, ScenarioProfile> = {
  scenario_normal: {
    amplitude: 24,
    variability: 3,
    maternalBase: 80,
    fetalBase: 142,
    electrodeQuality: 94,
    batteryLevel: 88,
    movementChance: 0.25,
    posture: 'lying_left'
  },
  scenario_braxton: {
    amplitude: 32,
    variability: 4,
    maternalBase: 86,
    fetalBase: 144,
    electrodeQuality: 90,
    batteryLevel: 82,
    movementChance: 0.3,
    posture: 'lying_left'
  },
  scenario_preterm: {
    amplitude: 42,
    variability: 5,
    maternalBase: 94,
    fetalBase: 148,
    electrodeQuality: 86,
    batteryLevel: 78,
    movementChance: 0.36,
    posture: 'lying_right'
  },
  scenario_emergency: {
    amplitude: 54,
    variability: 7,
    maternalBase: 108,
    fetalBase: 158,
    electrodeQuality: 82,
    batteryLevel: 72,
    movementChance: 0.45,
    posture: 'sitting'
  },
  scenario_electrode_loose: {
    amplitude: 30,
    variability: 6,
    maternalBase: 84,
    fetalBase: 140,
    electrodeQuality: 50,
    batteryLevel: 76,
    movementChance: 0.3,
    posture: 'lying_left'
  },
  scenario_fall: {
    amplitude: 36,
    variability: 8,
    maternalBase: 98,
    fetalBase: 146,
    electrodeQuality: 74,
    batteryLevel: 74,
    movementChance: 0.52,
    posture: 'standing'
  },
  scenario_multi_alert: {
    amplitude: 44,
    variability: 5,
    maternalBase: 96,
    fetalBase: 150,
    electrodeQuality: 84,
    batteryLevel: 80,
    movementChance: 0.4,
    posture: 'lying_right'
  },
  scenario_doctor_override: {
    amplitude: 40,
    variability: 4,
    maternalBase: 92,
    fetalBase: 146,
    electrodeQuality: 89,
    batteryLevel: 84,
    movementChance: 0.35,
    posture: 'lying_left'
  }
}

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

export class MockAdapter implements IDataSource {
  readonly name = 'MockAdapter'
  private _status: ConnectionStatus = 'disconnected'
  private timer: ReturnType<typeof setInterval> | null = null
  private frameHandlers = new Set<(frame: EHGFrame) => void>()
  private statusHandlers = new Set<(status: ConnectionStatus) => void>()
  private errorHandlers = new Set<(error: Error) => void>()
  private batteryHandlers = new Set<(level: number) => void>()
  private electrodeHandlers = new Set<(channel: number) => void>()
  private tick = 0

  async connect(config?: Record<string, unknown>): Promise<void> {
    const mockConfig = (config ?? {}) as MockAdapterConfig
    const scenario = mockConfig.scenario ?? 'scenario_normal'
    const profile = scenarioProfiles[scenario] ?? scenarioProfiles.scenario_normal
    const intervalMs = Math.max(200, toNumber(mockConfig.intervalMs, defaultIntervalMs))
    await this.disconnect()
    this.updateStatus('mock')
    this.tick = 0
    this.timer = setInterval(() => {
      this.tick += 1
      const frame = this.createFrame(profile, this.tick)
      this.frameHandlers.forEach((handler) => handler(frame))
      if (frame.batteryLevel < 25) this.batteryHandlers.forEach((handler) => handler(frame.batteryLevel))
      if (frame.electrodeQuality < 55) this.electrodeHandlers.forEach((handler) => handler(2))
    }, intervalMs)
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

  private createFrame(profile: ScenarioProfile, tick: number): EHGFrame {
    const wave = Math.sin(tick / 5)
    const trend = Math.cos(tick / 8)
    const motionFactor = profile.movementChance > Math.random() ? 1 : 0.25
    return {
      timestamp: Date.now(),
      ehg: Array.from({ length: 4 }, (_unused, index) => {
        const phase = tick / (4 + index * 2)
        return profile.amplitude + Math.sin(phase) * profile.variability + wave * (index + 1) * 0.8
      }),
      fetalHR: Math.round(profile.fetalBase + trend * 5 + Math.random() * 3),
      maternalHR: Math.round(profile.maternalBase + wave * 6 + Math.random() * 2),
      fetalMovement: Math.random() < profile.movementChance ? 1 : 0,
      imu: {
        ax: wave * 0.2 * motionFactor,
        ay: trend * 0.16 * motionFactor,
        az: 1 + Math.abs(wave * 0.1),
        gx: wave * 0.05 * motionFactor,
        gy: trend * 0.04 * motionFactor,
        gz: Math.sin(tick / 3) * 0.03 * motionFactor
      },
      electrodeQuality: Math.max(25, Math.round(profile.electrodeQuality - Math.abs(wave) * 8)),
      batteryLevel: Math.max(12, Math.round(profile.batteryLevel - tick * 0.04)),
      posture: profile.posture
    }
  }
}
