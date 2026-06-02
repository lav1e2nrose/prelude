import { create } from 'zustand'

// 全局设置。演示模式（mock）总开关集中于此：真实数据优先，演示模式显式开启，
// 开启时全局显示 DevModeBanner。生产构建可经环境变量进一步排除 Mock 代码。

export interface DevSettings {
  useMockDataSource: boolean
  useMockRiskEngine: boolean
  mockScenario: string
  mockIntervalMs: number
}

export interface NotificationSettings {
  dailySummary: boolean
  postureReminder: boolean
  nightLowStimulus: boolean
}

interface SettingsStore {
  /** 演示模式总开关（mock/真实分离的唯一真相）。默认开启，便于即时体验全部功能。 */
  demoMode: boolean
  dev: DevSettings
  notifications: NotificationSettings
  isDevMode: () => boolean
  setDemoMode: (on: boolean) => void
  setDev: (patch: Partial<DevSettings>) => void
  setNotifications: (patch: Partial<NotificationSettings>) => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  demoMode: true,
  dev: {
    // 演示模式默认开启，故 mock 默认启用；关闭演示模式即切回真实数据
    useMockDataSource: true,
    useMockRiskEngine: true,
    mockScenario: 'scenario_normal',
    mockIntervalMs: 200
  },
  notifications: {
    dailySummary: true,
    postureReminder: true,
    nightLowStimulus: false
  },
  isDevMode: () => {
    const { dev } = get()
    return dev.useMockDataSource || dev.useMockRiskEngine
  },
  setDemoMode: (on) => set(() => ({ demoMode: on })),
  setDev: (patch) => set((state) => ({ dev: { ...state.dev, ...patch } })),
  setNotifications: (patch) => set((state) => ({ notifications: { ...state.notifications, ...patch } }))
}))
