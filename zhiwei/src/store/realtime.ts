import { create } from 'zustand'
import { BLEAdapter } from '../data/adapters/BLEAdapter'
import { MockAdapter } from '../data/adapters/MockAdapter'
import { WebSocketAdapter } from '../data/adapters/WebSocketAdapter'
import { MockRiskEngine } from '../data/engines/MockRiskEngine'
import { RemoteRiskEngine } from '../data/engines/RemoteRiskEngine'
import { SignalProcessor } from '../data/SignalProcessor'
import type { ConnectionStatus, DeviceControlCommand, DeviceInfo, IDataSource } from '../data/IDataSource'
import type { IRiskEngine, RiskEngineRequest, RiskEngineStatus } from '../data/IRiskEngine'
import type { EHGFrame, ProcessedFrame, RiskExplanation } from '../types/signal'
import { computeGestationalAge } from '../utils/gestational'
import { useAppStore } from './index'
import { useAlertsStore } from './alerts'

type DataSourceType = 'mock' | 'websocket' | 'ble'
type RiskEngineMode = 'remote' | 'mock'

interface RealtimeSourceConfig {
  mock: { scenario: string; intervalMs: number }
  websocket: { url: string; authToken: string; reconnectIntervalMs: number; maxReconnectAttempts: number }
  ble: { deviceId: string; serviceUuid: string; characteristicUuid: string }
  algorithm: { baseUrl: string; token: string }
}

interface RealtimeStore {
  dataSourceType: DataSourceType
  riskEngineMode: RiskEngineMode
  connectionStatus: ConnectionStatus
  riskEngineStatus: RiskEngineStatus
  /** 算法未接入/不可用时为 true，UI 据此屏蔽风险数字、显示"等待算法服务" */
  riskUnavailable: boolean
  devices: DeviceInfo[]
  frameBuffer: ProcessedFrame[]
  latestFrame: ProcessedFrame | null
  lastFrameLatencyMs: number | null
  lastError: string | null
  sourceConfig: RealtimeSourceConfig
  setDataSourceType: (t: DataSourceType) => void
  setRiskEngineMode: (m: RiskEngineMode) => void
  patchSourceConfig: <T extends DataSourceType | 'algorithm'>(type: T, patch: Partial<RealtimeSourceConfig[T]>) => void
  scan: () => Promise<void>
  connect: (deviceId?: string) => Promise<void>
  reconnect: () => Promise<void>
  disconnect: () => Promise<void>
  sendControl: (cmd: DeviceControlCommand) => Promise<void>
}

const FRAME_BUFFER_LIMIT = 360
const ENGINE_WINDOW_SIZE = 60
const signalProcessor = new SignalProcessor()

const PLACEHOLDER_EXPLANATION: RiskExplanation = {
  modelVersion: '—',
  confidence: 0,
  confidenceInterval: [0, 0],
  featureContributions: [],
  oodScore: 0,
  similarPatients: [],
  counterfactuals: [],
  knownLimitations: []
}

let activeAdapter: IDataSource | null = null
let activeType: DataSourceType | null = null
let activeEngine: IRiskEngine | null = null
let engineMode: RiskEngineMode | null = null
let listenerDisposers: Array<() => void> = []
let rawWindow: EHGFrame[] = []
let evaluating = false

const clearAdapterListeners = () => {
  listenerDisposers.forEach((dispose) => dispose())
  listenerDisposers = []
}

const createAdapter = (type: DataSourceType): IDataSource => {
  if (type === 'websocket') return new WebSocketAdapter()
  if (type === 'mock') return new MockAdapter()
  return new BLEAdapter()
}

const sourceDefaults: RealtimeSourceConfig = {
  mock: { scenario: 'scenario_normal', intervalMs: 1000 },
  websocket: { url: 'ws://127.0.0.1:8787/stream', authToken: '', reconnectIntervalMs: 2500, maxReconnectAttempts: 8 },
  ble: { deviceId: '', serviceUuid: '', characteristicUuid: '' },
  algorithm: { baseUrl: '', token: '' }
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => {
  const ensureEngine = (mode: RiskEngineMode): IRiskEngine => {
    if (activeEngine && engineMode === mode) return activeEngine
    activeEngine?.dispose()
    const cfg = get().sourceConfig.algorithm
    activeEngine = mode === 'mock' ? new MockRiskEngine() : new RemoteRiskEngine({ baseUrl: cfg.baseUrl, token: cfg.token })
    engineMode = mode
    activeEngine.onStatusChange((status) => {
      set(() => ({ riskEngineStatus: status, riskUnavailable: status !== 'ready' }))
    })
    return activeEngine
  }

  const buildRequest = (): RiskEngineRequest | null => {
    const patient = useAppStore.getState().patient
    if (!patient) return null
    return {
      schemaVersion: 1,
      patientId: patient.patientId,
      gestationalAgeDays: computeGestationalAge(patient.dueDate).totalDays,
      riskFactors: patient.riskFactors,
      window: rawWindow.slice(-ENGINE_WINDOW_SIZE)
    }
  }

  const maybeRaiseAlert = (previous: ProcessedFrame | null, current: ProcessedFrame) => {
    const escalated =
      (current.riskLevel === 'alert' || current.riskLevel === 'emergency') &&
      previous?.riskLevel !== current.riskLevel
    if (!escalated) return
    useAlertsStore.getState().addAlert({
      id: `alert-${current.timestamp}`,
      patientId: useAppStore.getState().patient?.patientId ?? 'unknown',
      level: current.riskLevel,
      createdAt: current.timestamp,
      summary:
        current.riskLevel === 'emergency'
          ? '风险评分达紧急阈值，请立即启动紧急响应'
          : '风险评分升高，建议通知家属并联系医生',
      acknowledged: false
    })
  }

  return {
    dataSourceType: 'ble',
    riskEngineMode: 'remote',
    connectionStatus: 'idle',
    riskEngineStatus: 'unavailable',
    riskUnavailable: true,
    devices: [],
    frameBuffer: [],
    latestFrame: null,
    lastFrameLatencyMs: null,
    lastError: null,
    sourceConfig: sourceDefaults,
    setDataSourceType: (dataSourceType) => {
      if (get().dataSourceType === dataSourceType) return
      set(() => ({ dataSourceType, connectionStatus: 'idle', lastError: null }))
    },
    setRiskEngineMode: (riskEngineMode) => {
      if (get().riskEngineMode === riskEngineMode) return
      set(() => ({ riskEngineMode }))
      ensureEngine(riskEngineMode)
    },
    patchSourceConfig: (type, patch) => {
      set((state) => ({
        sourceConfig: { ...state.sourceConfig, [type]: { ...state.sourceConfig[type], ...patch } }
      }))
    },
    scan: async () => {
      const adapter = activeAdapter ?? createAdapter(get().dataSourceType)
      if (!activeAdapter) {
        activeAdapter = adapter
        activeType = get().dataSourceType
      }
      try {
        const devices = await adapter.scan()
        set(() => ({ devices }))
      } catch (error) {
        set(() => ({ lastError: error instanceof Error ? error.message : '扫描设备失败' }))
      }
    },
    connect: async (deviceId) => {
      const state = get()
      if (state.connectionStatus === 'connected' && activeType === state.dataSourceType && activeAdapter) return

      if (activeAdapter) {
        await activeAdapter.disconnect()
        clearAdapterListeners()
        activeAdapter = null
        activeType = null
      }

      const adapter = createAdapter(state.dataSourceType)
      activeAdapter = adapter
      activeType = state.dataSourceType
      rawWindow = []
      const engine = ensureEngine(state.riskEngineMode)
      set(() => ({ riskEngineStatus: engine.status, riskUnavailable: engine.status !== 'ready' }))

      listenerDisposers = [
        adapter.onStatusChange((status) => set(() => ({ connectionStatus: status }))),
        adapter.onError((error) => set(() => ({ lastError: error.message, connectionStatus: 'error' }))),
        adapter.onBatteryLow((level) => set(() => ({ lastError: `设备电量较低（${Math.round(level)}%）` }))),
        adapter.onElectrodeLoose((channel) => set(() => ({ lastError: `检测到 ${channel} 号通道电极接触不稳定` }))),
        adapter.onFrame((frame) => {
          rawWindow = [...rawWindow.slice(-(ENGINE_WINDOW_SIZE - 1)), frame]
          const display = signalProcessor.extractDisplay(frame)
          if (evaluating) return
          evaluating = true
          const req = buildRequest()
          const finalize = (processed: ProcessedFrame) => {
            set((current) => {
              maybeRaiseAlert(current.latestFrame, processed)
              const buffer =
                current.frameBuffer.length >= FRAME_BUFFER_LIMIT
                  ? [...current.frameBuffer.slice(1), processed]
                  : [...current.frameBuffer, processed]
              return { latestFrame: processed, frameBuffer: buffer, lastFrameLatencyMs: Math.max(0, Date.now() - frame.timestamp) }
            })
            evaluating = false
          }

          if (!req) {
            evaluating = false
            return
          }

          void engine
            .evaluate(req)
            .then((resp) => {
              if (resp.ok) {
                const a = resp.assessment
                set(() => ({ riskUnavailable: false, riskEngineStatus: 'ready' }))
                finalize({
                  ...frame,
                  contractionState: a.contractionState,
                  contractionIntensity: a.contractionIntensity,
                  pretermRiskScore: a.pretermRiskScore,
                  riskLevel: a.riskLevel,
                  pretermRiskExplanation: a.explanation,
                  artifacts: display.artifacts,
                  features: a.features
                })
              } else {
                set(() => ({ riskUnavailable: true, riskEngineStatus: engine.status }))
                finalize({
                  ...frame,
                  contractionState: display.contractionState,
                  contractionIntensity: display.contractionIntensity,
                  pretermRiskScore: 0,
                  riskLevel: 'safe',
                  pretermRiskExplanation: PLACEHOLDER_EXPLANATION,
                  artifacts: display.artifacts,
                  features: display.features
                })
              }
            })
            .catch(() => {
              evaluating = false
            })
        })
      ]

      set(() => ({ lastError: null }))
      try {
        const cfg = { ...state.sourceConfig[state.dataSourceType] } as Record<string, unknown>
        await adapter.connect(deviceId, cfg)
      } catch (error) {
        set(() => ({ lastError: error instanceof Error ? error.message : '数据源连接失败', connectionStatus: 'error' }))
      }
    },
    reconnect: async () => {
      await get().disconnect()
      await get().connect()
    },
    disconnect: async () => {
      if (activeAdapter) await activeAdapter.disconnect()
      clearAdapterListeners()
      activeAdapter = null
      activeType = null
      rawWindow = []
      set(() => ({ connectionStatus: 'idle', lastFrameLatencyMs: null }))
    },
    sendControl: async (cmd) => {
      if (!activeAdapter) return
      try {
        await activeAdapter.sendControl(cmd)
      } catch (error) {
        set(() => ({ lastError: error instanceof Error ? error.message : '控制指令失败' }))
      }
    }
  }
})
