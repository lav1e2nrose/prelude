import { useEffect } from 'react'
import { BreathingCircle } from '../../components/charts/BreathingCircle'
import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { useAppStore, useRealtimeStore } from '../../store'

export const LiveMonitor = () => {
  const mockScenario = useAppStore((state) => state.mockScenario)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const setDataSourceType = useRealtimeStore((state) => state.setDataSourceType)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const frameBuffer = useRealtimeStore((state) => state.frameBuffer)
  const lastFrameLatencyMs = useRealtimeStore((state) => state.lastFrameLatencyMs)
  const lastError = useRealtimeStore((state) => state.lastError)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const patchSourceConfig = useRealtimeStore((state) => state.patchSourceConfig)
  const bindMockScenario = useRealtimeStore((state) => state.bindMockScenario)
  const connect = useRealtimeStore((state) => state.connect)
  const disconnect = useRealtimeStore((state) => state.disconnect)
  const reconnect = useRealtimeStore((state) => state.reconnect)

  useEffect(() => {
    bindMockScenario(mockScenario)
  }, [bindMockScenario, mockScenario])

  useEffect(() => {
    if (dataSourceType !== 'mock') return
    void reconnect()
  }, [dataSourceType, mockScenario, reconnect])

  const sourceStatusLabel: Record<typeof connectionStatus, string> = {
    disconnected: '未连接',
    pairing: '连接中',
    connected: '已连接',
    reconnecting: '重连中',
    error: '异常',
    mock: 'Mock'
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <EHGWaveformChart frames={frameBuffer} />
        <ContractionHeatmap frames={frameBuffer} />
      </div>
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">实测接口</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { type: 'mock', label: 'Mock' },
              { type: 'websocket', label: 'WebSocket' },
              { type: 'ble', label: 'BLE' }
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setDataSourceType(item.type as 'mock' | 'websocket' | 'ble')}
                className={`rounded-[var(--radius-control)] border px-3 py-2 text-xs transition ${
                  dataSourceType === item.type
                    ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-2)] text-slate-300 hover:border-[var(--border-default)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {dataSourceType === 'websocket' ? (
            <div className="mt-3 space-y-2">
              <input
                value={sourceConfig.websocket.url}
                onChange={(event) => patchSourceConfig('websocket', { url: event.target.value })}
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
                placeholder="ws://127.0.0.1:8787/stream"
              />
              <input
                value={sourceConfig.websocket.authToken}
                onChange={(event) => patchSourceConfig('websocket', { authToken: event.target.value })}
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
                placeholder="可选 token"
              />
            </div>
          ) : null}

          {dataSourceType === 'ble' ? (
            <div className="mt-3 space-y-2">
              <input
                value={sourceConfig.ble.deviceId}
                onChange={(event) => patchSourceConfig('ble', { deviceId: event.target.value })}
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
                placeholder="设备 ID（可选）"
              />
              <input
                value={sourceConfig.ble.serviceUuid}
                onChange={(event) => patchSourceConfig('ble', { serviceUuid: event.target.value })}
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
                placeholder="Service UUID（可选）"
              />
            </div>
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void connect()}
              className="flex-1 rounded-[var(--radius-control)] border border-emerald-300/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100 transition hover:bg-emerald-500/20"
            >
              连接
            </button>
            <button
              type="button"
              onClick={() => void disconnect()}
              className="flex-1 rounded-[var(--radius-control)] border border-slate-400/25 bg-slate-500/10 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-500/20"
            >
              断开
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            状态：{sourceStatusLabel[connectionStatus]}
            {lastError ? ` · ${lastError}` : ''}
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">实时摘要</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusOrb level={latestFrame?.riskLevel ?? 'attention'} label="实时风险状态" />
            <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
              数据延迟 {lastFrameLatencyMs === null ? '--' : `${(lastFrameLatencyMs / 1000).toFixed(1)}s`}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              {
                label: '母体心率',
                value: latestFrame ? `${latestFrame.maternalHR} bpm` : '--',
                hint: latestFrame ? '来自实时采样' : '等待数据'
              },
              {
                label: '胎心率',
                value: latestFrame?.fetalHR ? `${latestFrame.fetalHR} bpm` : '--',
                hint: latestFrame?.fetalHR ? '来自实时采样' : '等待数据'
              },
              {
                label: '体位',
                value: latestFrame?.posture ?? '--',
                hint: latestFrame ? '自动识别' : '等待数据'
              },
              {
                label: '电极质量',
                value: latestFrame ? `${latestFrame.electrodeQuality}%` : '--',
                hint: latestFrame ? '来自实时采样' : '等待数据'
              }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm text-slate-300">
                <span>{item.label}</span>
                <span className="text-slate-200">{item.value}</span>
                <span className="text-xs text-slate-400">{item.hint}</span>
              </div>
            ))}
          </div>
        </div>
        <BreathingCircle />
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-300">
          监测提示：若宫缩间隔持续缩短，可点击“宫缩记录”页面进行手动标记，便于医生复核。
        </div>
      </div>
    </div>
  )
}
