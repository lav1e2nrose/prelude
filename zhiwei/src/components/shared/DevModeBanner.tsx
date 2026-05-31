import { useRealtimeStore } from '../../store'

// 开发模式标识：当数据源或风险引擎处于 Mock 时全局常驻，提醒"非临床数据"。
// 生产模式（真实 BLE + 远程算法）下不出现。
export const DevModeBanner = () => {
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const riskEngineMode = useRealtimeStore((state) => state.riskEngineMode)
  const mockDevice = dataSourceType === 'mock'
  const mockEngine = riskEngineMode === 'mock'
  if (!mockDevice && !mockEngine) return null

  const parts = [mockDevice ? '模拟设备数据' : null, mockEngine ? '模拟算法' : null].filter(Boolean).join(' + ')

  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-200">
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
      开发模式 · 当前使用{parts}，禁止用于临床
    </div>
  )
}
