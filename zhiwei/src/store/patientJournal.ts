import { create } from 'zustand'

export type ContractionIntensity = '轻度' | '中等' | '偏强' | '强烈'

interface ContractionLogEntry {
  id: string
  timestamp: number
  durationSec: number
  intensity: ContractionIntensity
  source: 'manual' | 'algorithm'
  status: 'pending' | 'confirmed' | 'false_positive'
}

interface FetalMovementEntry {
  id: string
  timestamp: number
  source: 'manual' | 'algorithm'
}

interface TimelineEvent {
  id: string
  timestamp: number
  title: string
  detail: string
}

interface MonitorSession {
  id: string
  startedAt: number
  endedAt: number
  durationSec: number
}

interface PatientJournalStore {
  contractions: ContractionLogEntry[]
  fetalMovements: FetalMovementEntry[]
  timeline: TimelineEvent[]
  monitorSessions: MonitorSession[]
  activeMonitoringStartedAt: number | null
  addContraction: (payload: {
    timestamp?: number
    durationSec: number
    intensity: ContractionIntensity
    source: 'manual' | 'algorithm'
  }) => void
  markContractionFalsePositive: (id: string) => void
  addFetalMovement: (source?: 'manual' | 'algorithm', timestamp?: number) => void
  removeLastManualFetalMovement: () => void
  addTimelineEvent: (title: string, detail: string, timestamp?: number) => void
  startMonitoring: () => void
  stopMonitoring: () => number | null
  /** 载入演示数据（仅演示模式调用） */
  loadDemo: () => void
  /** 清空全部记录（切回真实模式时调用，避免真实模式残留模拟数据） */
  reset: () => void
}

const now = Date.now()
const hour = 1000 * 60 * 60

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`

const initialContractions: ContractionLogEntry[] = [
  {
    id: 'contraction-1',
    timestamp: now - hour * 9.2,
    durationSec: 42,
    intensity: '中等',
    source: 'algorithm',
    status: 'confirmed'
  },
  {
    id: 'contraction-2',
    timestamp: now - hour * 6.7,
    durationSec: 55,
    intensity: '偏强',
    source: 'manual',
    status: 'pending'
  },
  {
    id: 'contraction-3',
    timestamp: now - hour * 4.5,
    durationSec: 36,
    intensity: '轻度',
    source: 'algorithm',
    status: 'confirmed'
  }
]

const initialMovements: FetalMovementEntry[] = Array.from({ length: 18 }, (_unused, index) => ({
  id: `movement-${index + 1}`,
  timestamp: now - hour * 7 + index * 1000 * 60 * 24,
  source: index % 3 === 0 ? 'algorithm' : 'manual'
}))

const initialTimeline: TimelineEvent[] = [
  { id: 'timeline-1', timestamp: now - hour * 9.5, title: '开始监测', detail: '左侧卧，设备连接稳定' },
  { id: 'timeline-2', timestamp: now - hour * 8.4, title: '胎动 +1', detail: '手动记录' },
  { id: 'timeline-3', timestamp: now - hour * 6.7, title: '宫缩记录', detail: '偏强 55 秒（待复核）' },
  { id: 'timeline-4', timestamp: now - hour * 6.2, title: '结束监测', detail: '本次 48 分钟，已同步医生端' },
  { id: 'timeline-5', timestamp: now - hour * 3.1, title: '开始监测', detail: '午后复测' },
  { id: 'timeline-6', timestamp: now - hour * 2.4, title: '症状记录', detail: '腹部短暂紧绷，已自缓解' }
]

const MAX_TIMELINE = 36

const toTimeLabel = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

export const usePatientJournalStore = create<PatientJournalStore>((set, get) => ({
  // 默认空：真实模式下不展示任何模拟数据。演示数据经 loadDemo() 载入。
  contractions: [],
  fetalMovements: [],
  timeline: [],
  monitorSessions: [],
  activeMonitoringStartedAt: null,
  loadDemo: () =>
    set(() => ({
      contractions: initialContractions,
      fetalMovements: initialMovements,
      timeline: initialTimeline
    })),
  reset: () =>
    set(() => ({
      contractions: [],
      fetalMovements: [],
      timeline: [],
      monitorSessions: [],
      activeMonitoringStartedAt: null
    })),
  addContraction: ({ timestamp = Date.now(), durationSec, intensity, source }) => {
    const id = makeId('contraction')
    const normalizedDuration = Math.max(10, Math.min(240, Math.round(durationSec)))
    const entry: ContractionLogEntry = {
      id,
      timestamp,
      durationSec: normalizedDuration,
      intensity,
      source,
      status: source === 'algorithm' ? 'confirmed' : 'pending'
    }
    set((state) => ({
      contractions: [entry, ...state.contractions],
      timeline: [
        {
          id: makeId('timeline'),
          timestamp,
          title: '宫缩记录',
          detail: `${intensity} ${normalizedDuration} 秒（${source === 'manual' ? '手动' : '算法'}）`
        },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))
  },
  markContractionFalsePositive: (id) => {
    const target = get().contractions.find((item) => item.id === id)
    if (!target) return
    set((state) => ({
      contractions: state.contractions.map((item) => (item.id === id ? { ...item, status: 'false_positive' } : item)),
      timeline: [
        {
          id: makeId('timeline'),
          timestamp: Date.now(),
          title: '误报反馈',
          detail: `${toTimeLabel(target.timestamp)} 的宫缩记录已标记为误报`
        },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))
  },
  addFetalMovement: (source = 'manual', timestamp = Date.now()) => {
    set((state) => ({
      fetalMovements: [{ id: makeId('movement'), timestamp, source }, ...state.fetalMovements],
      timeline: [
        {
          id: makeId('timeline'),
          timestamp,
          title: '胎动 +1',
          detail: source === 'manual' ? '手动记录' : '设备自动识别'
        },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))
  },
  removeLastManualFetalMovement: () => {
    const lastManual = get().fetalMovements.find((item) => item.source === 'manual')
    if (!lastManual) return
    set((state) => ({
      fetalMovements: state.fetalMovements.filter((item) => item.id !== lastManual.id),
      timeline: [
        {
          id: makeId('timeline'),
          timestamp: Date.now(),
          title: '撤销胎动记录',
          detail: `已撤销 ${toTimeLabel(lastManual.timestamp)} 的手动记录`
        },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))
  },
  addTimelineEvent: (title, detail, timestamp = Date.now()) => {
    set((state) => ({
      timeline: [{ id: makeId('timeline'), timestamp, title, detail }, ...state.timeline].slice(0, MAX_TIMELINE)
    }))
  },
  startMonitoring: () => {
    const startedAt = Date.now()
    set((state) => ({
      activeMonitoringStartedAt: startedAt,
      timeline: [
        { id: makeId('timeline'), timestamp: startedAt, title: '开始监测', detail: '实时采样与风险评估启动' },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))
  },
  stopMonitoring: () => {
    const startedAt = get().activeMonitoringStartedAt
    if (!startedAt) return null
    const endedAt = Date.now()
    const durationSec = Math.max(1, Math.round((endedAt - startedAt) / 1000))
    const nextSession: MonitorSession = {
      id: makeId('session'),
      startedAt,
      endedAt,
      durationSec
    }

    set((state) => ({
      activeMonitoringStartedAt: null,
      monitorSessions: [nextSession, ...state.monitorSessions],
      timeline: [
        {
          id: makeId('timeline'),
          timestamp: endedAt,
          title: '结束监测',
          detail: `本次 ${(durationSec / 60).toFixed(0)} 分钟，数据已同步`
        },
        ...state.timeline
      ].slice(0, MAX_TIMELINE)
    }))

    return durationSec
  }
}))
