import { useEffect, useMemo, useState } from 'react'
import { BreathingCircle } from '../../components/charts/BreathingCircle'
import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { useMemorialStore, usePatientJournalStore, useRealtimeStore } from '../../store'
import { confirmDialog } from '../../store/dialog'
import { toast } from '../../store/toast'

const postureLabelMap: Record<string, string> = {
  standing: '站立',
  sitting: '坐姿',
  lying_left: '左侧卧',
  lying_right: '右侧卧',
  lying_back: '平躺',
  unknown: '未知'
}

const formatDuration = (seconds: number) => {
  const hour = Math.floor(seconds / 3600)
  const minute = Math.floor((seconds % 3600) / 60)
  const second = seconds % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

export const LiveMonitor = () => {
  const [viewMode, setViewMode] = useState<'soft' | 'pro'>('soft')
  const [now, setNow] = useState(() => Date.now())
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const frameBuffer = useRealtimeStore((state) => state.frameBuffer)
  const lastFrameLatencyMs = useRealtimeStore((state) => state.lastFrameLatencyMs)
  const lastError = useRealtimeStore((state) => state.lastError)
  const riskUnavailable = useRealtimeStore((state) => state.riskUnavailable)
  const connect = useRealtimeStore((state) => state.connect)
  const disconnect = useRealtimeStore((state) => state.disconnect)
  const orbLevel = !latestFrame || riskUnavailable ? 'unknown' : latestFrame.riskLevel

  const activeMonitoringStartedAt = usePatientJournalStore((state) => state.activeMonitoringStartedAt)
  const startMonitoring = usePatientJournalStore((state) => state.startMonitoring)
  const stopMonitoring = usePatientJournalStore((state) => state.stopMonitoring)
  const addTimelineEvent = usePatientJournalStore((state) => state.addTimelineEvent)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const sourceStatusLabel: Record<typeof connectionStatus, string> = {
    idle: '未连接',
    scanning: '扫描设备中',
    pairing: '连接中',
    connected: '已连接',
    reconnecting: '重连中',
    error: '异常',
    mock: 'Mock'
  }

  const monitorDuration = useMemo(() => {
    if (!activeMonitoringStartedAt) return 0
    return Math.max(0, Math.round((now - activeMonitoringStartedAt) / 1000))
  }, [activeMonitoringStartedAt, now])

  const isMonitoring = activeMonitoringStartedAt !== null
  const isConnecting = connectionStatus === 'scanning' || connectionStatus === 'pairing' || connectionStatus === 'reconnecting'
  const isConnected = connectionStatus === 'connected' || connectionStatus === 'mock'
  const handleConnect = async () => {
    await connect()
    const status = useRealtimeStore.getState().connectionStatus
    if ((status === 'connected' || status === 'mock') && !usePatientJournalStore.getState().activeMonitoringStartedAt) {
      startMonitoring()
      toast.success('监测已开始', '实时采样与风险评估已启动')
    } else if (status === 'error') {
      toast.alert('连接失败', useRealtimeStore.getState().lastError ?? '请检查设备或在设置中启用演示模式')
    }
  }

  const handleDisconnect = async () => {
    if (!memorialEnabled && isMonitoring && monitorDuration < 40 * 60) {
      const shouldStop = await confirmDialog({
        title: '确定结束本次监测吗？',
        body: `本次监测仅 ${Math.round(monitorDuration / 60)} 分钟，建议至少 40 分钟以获得可靠的风险评估。`,
        confirmText: '结束监测',
        cancelText: '继续监测',
        tone: 'danger'
      })
      if (!shouldStop) {
        addTimelineEvent('继续监测', '用户取消提前结束操作')
        return
      }
    }

    await disconnect()
    const duration = stopMonitoring()
    if (duration !== null) {
      addTimelineEvent('监测结束确认', `本次监测 ${Math.round(duration / 60)} 分钟`)
      toast.info('监测已结束', `本次监测 ${Math.round(duration / 60)} 分钟，数据已保存`)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">{memorialEnabled ? '手动查看数据' : '实时监测'}</div>
            <div className="flex rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('soft')}
                className={`rounded-[var(--radius-control)] px-3 py-1 ${
                  viewMode === 'soft' ? 'bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'text-slate-400'
                }`}
              >
                柔和模式
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pro')}
                className={`rounded-[var(--radius-control)] px-3 py-1 ${
                  viewMode === 'pro' ? 'bg-[var(--accent-dim)] text-[var(--text-primary)]' : 'text-slate-400'
                }`}
              >
                专业模式
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              {isMonitoring && isConnected ? (
                <>
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" style={{ animation: 'orb-pulse 2s ease-in-out infinite', ['--orb-glow' as string]: 'var(--safe-glow)' }} />
                  监测中 · {formatDuration(monitorDuration)}
                </>
              ) : isConnecting ? (
                <>
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                  {connectionStatus === 'scanning' ? '扫描设备中…' : '连接中…'}
                </>
              ) : (
                <>
                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
                  未在监测
                </>
              )}
            </div>
            <StatusOrb level={orbLevel} label={memorialEnabled ? '当前数据状态' : '实时风险状态'} />
          </div>

          {viewMode === 'soft' ? (
            <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/80 p-5">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-48 w-48 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-1)]/85 shadow-[var(--shadow-card)]">
                  <div className="h-36 w-36 animate-[breathing_6s_ease-in-out_infinite] rounded-full bg-[var(--safe)]/20" />
                </div>
                <div className="text-xl font-semibold text-[var(--text-primary)]">
                  {latestFrame?.riskLevel === 'safe' ? '平静中' : latestFrame?.riskLevel === 'attention' ? '请持续观察' : '建议尽快处理'}
                </div>
                <div className="text-sm text-slate-400">电极贴合度 {latestFrame?.electrodeQuality ?? '--'}% · 设备电量 {latestFrame?.batteryLevel ? `${Math.round(latestFrame.batteryLevel)}%` : '--'}</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <EHGWaveformChart frames={frameBuffer} />
              <ContractionHeatmap frames={frameBuffer} />
              <div className="grid gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4 md:grid-cols-2">
                <div className="text-sm text-slate-300">母体心率 {latestFrame ? `${latestFrame.maternalHR} bpm` : '--'}</div>
                <div className="text-sm text-slate-300">胎心率 {latestFrame?.fetalHR ? `${latestFrame.fetalHR} bpm` : '--'}</div>
                <div className="text-sm text-slate-300">体位 {postureLabelMap[latestFrame?.posture ?? 'unknown']}</div>
                <div className="text-sm text-slate-300">24h 风险 {latestFrame?.features.pretermProbability24h.toFixed(1) ?? '--'}%</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">数据接入</div>
          <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-300">
            当前来源：{dataSourceType === 'ble' ? '真实设备' : dataSourceType === 'websocket' ? '实时网关' : '示例数据'}
          </div>
          <div className="mt-2 text-xs text-slate-400">如需调整数据源和示例参数，请前往设置页面。</div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void handleConnect()}
              className="min-h-[52px] flex-1 rounded-[var(--radius-control)] border border-emerald-300/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/20"
            >
              连接
            </button>
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="min-h-[52px] flex-1 rounded-[var(--radius-control)] border border-slate-400/25 bg-slate-500/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-500/20"
            >
              结束监测
            </button>
          </div>
          {memorialEnabled ? (
            <div className="mt-2 text-xs text-slate-400">静默模式下不会主动显示连接提示或提醒。</div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">
              状态：{sourceStatusLabel[connectionStatus]}
              {lastError ? ` · ${lastError}` : ''}
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">实时摘要</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusOrb level={orbLevel} label={memorialEnabled ? '当前数据状态' : '实时风险状态'} />
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
                value: postureLabelMap[latestFrame?.posture ?? 'unknown'],
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

        {!memorialEnabled ? <BreathingCircle /> : null}

        {memorialEnabled ? null : (
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-300">
            监测提示：若宫缩间隔持续缩短，可点击“宫缩记录”页面进行手动标记，便于医生复核。
          </div>
        )}
      </div>
    </div>
  )
}
