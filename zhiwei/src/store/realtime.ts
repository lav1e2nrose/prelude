import { create } from 'zustand'
import { BLEAdapter } from '../data/adapters/BLEAdapter'
import { MockAdapter } from '../data/adapters/MockAdapter'
import { WebSocketAdapter } from '../data/adapters/WebSocketAdapter'
import { SignalProcessor } from '../data/SignalProcessor'
import { getMockScenarioDefinition } from '../data/mockScenarios'
import type { IDataSource } from '../data/IDataSource'
import type { ConnectionStatus } from '../data/IDataSource'
import type { ProcessedFrame } from '../types/signal'

type DataSourceType = 'mock' | 'websocket' | 'ble'

interface RealtimeSourceConfig {
  mock: {
    scenario: string
    intervalMs: number
  }
  websocket: {
    url: string
    authToken: string
    reconnectIntervalMs: number
    maxReconnectAttempts: number
  }
  ble: {
    deviceId: string
    serviceUuid: string
    characteristicUuid: string
  }
}

interface RealtimeStore {
  dataSourceType: DataSourceType
  connectionStatus: ConnectionStatus
  frameBuffer: ProcessedFrame[]
  latestFrame: ProcessedFrame | null
  lastFrameLatencyMs: number | null
  lastError: string | null
  sourceConfig: RealtimeSourceConfig
  setDataSourceType: (dataSourceType: DataSourceType) => void
  patchSourceConfig: <T extends DataSourceType>(type: T, patch: Partial<RealtimeSourceConfig[T]>) => void
  bindMockScenario: (scenarioId: number) => void
  connect: () => Promise<void>
  reconnect: () => Promise<void>
  disconnect: () => Promise<void>
}

const frameBufferLimit = 360
const signalProcessor = new SignalProcessor()
let activeAdapter: IDataSource | null = null
let activeType: DataSourceType | null = null
let listenerDisposers: Array<() => void> = []

const clearAdapterListeners = () => {
  listenerDisposers.forEach((dispose) => dispose())
  listenerDisposers = []
}

const createAdapter = (type: DataSourceType): IDataSource => {
  if (type === 'websocket') return new WebSocketAdapter()
  if (type === 'ble') return new BLEAdapter()
  return new MockAdapter()
}

const sourceDefaults: RealtimeSourceConfig = {
  mock: {
    scenario: 'scenario_normal',
    intervalMs: 1000
  },
  websocket: {
    url: 'ws://127.0.0.1:8787/stream',
    authToken: '',
    reconnectIntervalMs: 2500,
    maxReconnectAttempts: 8
  },
  ble: {
    deviceId: '',
    serviceUuid: '',
    characteristicUuid: ''
  }
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  dataSourceType: 'mock',
  connectionStatus: 'disconnected',
  frameBuffer: [],
  latestFrame: null,
  lastFrameLatencyMs: null,
  lastError: null,
  sourceConfig: sourceDefaults,
  setDataSourceType: (dataSourceType) => {
    const previousType = get().dataSourceType
    if (previousType === dataSourceType) return
    set(() => ({ dataSourceType, connectionStatus: 'disconnected', lastError: null }))
  },
  patchSourceConfig: (type, patch) => {
    set((state) => ({
      sourceConfig: {
        ...state.sourceConfig,
        [type]: {
          ...state.sourceConfig[type],
          ...patch
        }
      }
    }))
  },
  bindMockScenario: (scenarioId) => {
    const scenario = getMockScenarioDefinition(scenarioId)
    set((state) => ({
      sourceConfig: {
        ...state.sourceConfig,
        mock: {
          ...state.sourceConfig.mock,
          scenario: scenario.code
        }
      }
    }))
  },
  connect: async () => {
    const state = get()
    if (state.connectionStatus === 'connected' && activeType === state.dataSourceType && activeAdapter) {
      return
    }

    if (activeAdapter) {
      await activeAdapter.disconnect()
      clearAdapterListeners()
      activeAdapter = null
      activeType = null
    }

    const adapter = createAdapter(state.dataSourceType)
    activeAdapter = adapter
    activeType = state.dataSourceType
    listenerDisposers = [
      adapter.onStatusChange((status) => {
        set(() => ({ connectionStatus: status }))
      }),
      adapter.onError((error) => {
        set(() => ({ lastError: error.message, connectionStatus: 'error' }))
      }),
      adapter.onBatteryLow((level) => {
        set(() => ({ lastError: `设备电量较低（${Math.round(level)}%）` }))
      }),
      adapter.onElectrodeLoose((channel) => {
        set(() => ({ lastError: `检测到 ${channel} 号通道电极接触不稳定` }))
      }),
      adapter.onFrame((frame) => {
        const processed = signalProcessor.processFrame(frame)
        set((current) => ({
          latestFrame: processed,
          lastFrameLatencyMs: Math.max(0, Date.now() - frame.timestamp),
          frameBuffer:
            current.frameBuffer.length >= frameBufferLimit
              ? [...current.frameBuffer.slice(1), processed]
              : [...current.frameBuffer, processed]
        }))
      })
    ]

    set(() => ({ lastError: null }))
    try {
      await adapter.connect(state.sourceConfig[state.dataSourceType] as Record<string, unknown>)
    } catch (error) {
      set(() => ({
        lastError: error instanceof Error ? error.message : '数据源连接失败',
        connectionStatus: 'error'
      }))
    }
  },
  reconnect: async () => {
    await get().disconnect()
    await get().connect()
  },
  disconnect: async () => {
    if (activeAdapter) {
      await activeAdapter.disconnect()
    }
    clearAdapterListeners()
    activeAdapter = null
    activeType = null
    set(() => ({ connectionStatus: 'disconnected', lastFrameLatencyMs: null }))
  }
}))
