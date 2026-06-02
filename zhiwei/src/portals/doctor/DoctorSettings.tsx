import { useState } from 'react'
import { mockScenarios } from '../../data/mockScenarios'
import { useMemorialWorkflowStore, useRealtimeStore } from '../../store'
import { toast } from '../../store/toast'

export const DoctorSettings = () => {
  const doctorVisibleNotice = useMemorialWorkflowStore((state) => state.doctorVisibleNotice)
  const legalRetentionYears = useMemorialWorkflowStore((state) => state.legalRetentionYears)
  const currentPregnancyMode = useMemorialWorkflowStore((state) => state.currentPregnancyMode)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const setDataSourceType = useRealtimeStore((state) => state.setDataSourceType)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const patchSourceConfig = useRealtimeStore((state) => state.patchSourceConfig)
  const riskEngineMode = useRealtimeStore((state) => state.riskEngineMode)
  const riskEngineStatus = useRealtimeStore((state) => state.riskEngineStatus)
  const setRiskEngineMode = useRealtimeStore((state) => state.setRiskEngineMode)
  const connectRemoteAlgorithm = useRealtimeStore((state) => state.connectRemoteAlgorithm)
  const reconnect = useRealtimeStore((state) => state.reconnect)
  const [threshold, setThreshold] = useState(65)
  const [dailyDigest, setDailyDigest] = useState(true)
  const [algoUrl, setAlgoUrl] = useState(() => sourceConfig.algorithm.baseUrl || 'http://127.0.0.1:8000')
  const [algoToken, setAlgoToken] = useState(() => sourceConfig.algorithm.token)
  const [healthMsg, setHealthMsg] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const checkHealth = async () => {
    setHealthMsg('检测中…')
    try {
      const res = await fetch(`${algoUrl.replace(/\/$/, '')}/health`)
      const data = (await res.json()) as { status?: string; modelVersion?: string }
      setHealthMsg(`服务状态：${data.status ?? '未知'} · 模型 ${data.modelVersion ?? '-'}`)
    } catch {
      setHealthMsg('无法连接，请确认算法服务已启动（uvicorn serve:app）')
    }
  }

  const connectAlgo = async () => {
    setConnecting(true)
    await connectRemoteAlgorithm(algoUrl, algoToken)
    setConnecting(false)
    const status = useRealtimeStore.getState().riskEngineStatus
    if (status === 'ready') toast.success('已接入真实算法服务', '在线风险评估改由模型输出')
    else toast.attention('已切换到真实算法', '等待算法服务响应；可先“检测连通性”确认服务在线')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">医生端设置</div>
        <p className="mt-3 text-xs text-slate-400">通知阈值、模型版本与团队信息在此配置。</p>
      </div>

      {/* 真实算法服务对接（对接 algo/serve.py） */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">算法服务对接</div>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] ${
            riskEngineMode === 'remote' && riskEngineStatus === 'ready'
              ? 'border-emerald-400/30 text-emerald-300'
              : riskEngineMode === 'remote'
                ? 'border-sky-400/30 text-sky-300'
                : 'border-slate-500/30 text-slate-400'
          }`}>
            {riskEngineMode === 'remote' ? `远程算法 · ${riskEngineStatus === 'ready' ? '就绪' : '未就绪'}` : '模拟算法'}
          </span>
        </div>
        <div className="mt-2 text-xs leading-6 text-slate-400">
          接入算法团队的推理服务（仓库 <span className="text-slate-300">algo/serve.py</span>，默认 http://127.0.0.1:8000）。
          接入后在线风险评估改由真实模型给出；未启动服务时风险位显示“等待算法服务接入”。
        </div>
        <div className="mt-3 space-y-2">
          <input
            value={algoUrl}
            onChange={(e) => setAlgoUrl(e.target.value)}
            placeholder="算法服务地址，如 http://127.0.0.1:8000"
            className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          />
          <input
            value={algoToken}
            onChange={(e) => setAlgoToken(e.target.value)}
            placeholder="鉴权 token（可选）"
            className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={checkHealth} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200 transition hover:bg-[var(--bg-2)]">检测连通性</button>
            <button type="button" disabled={connecting} onClick={() => void connectAlgo()} className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-2 text-xs text-white transition hover:brightness-110 disabled:opacity-50">{connecting ? '接入中…' : '接入真实算法'}</button>
            {riskEngineMode === 'remote' ? (
              <button type="button" onClick={() => { setRiskEngineMode('mock'); void reconnect(); toast.info('已切回模拟算法') }} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-300 transition hover:bg-[var(--bg-2)]">用模拟算法</button>
            ) : null}
          </div>
          {healthMsg ? <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">{healthMsg}</div> : null}
          <div className="text-[11px] leading-5 text-slate-500">
            提示：可保持「数据源 = Mock」让波形持续流动，同时「算法 = 真实」用模型评估这些窗口，便于无硬件联调。
          </div>
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">风险阈值</div>
        <div className="mt-3 text-xs text-slate-400">当风险评分高于 {threshold}% 时推送红色预警。</div>
        <input
          type="range"
          min={50}
          max={90}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
          className="mt-3 w-full"
        />
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">摘要通知</div>
        <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={dailyDigest} onChange={() => setDailyDigest((prev) => !prev)} />
          每日 18:00 发送患者总体摘要
        </label>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">数据留存</div>
        <div className="mt-2 text-xs text-slate-400">当前法定保留期：{legalRetentionYears} 年。用户 App 端删除与医疗机构留存按法规分离处理。</div>
        <div className="mt-2 text-xs text-slate-500">患者当前新孕程模式：{currentPregnancyMode}（医生端始终可见完整既往历史）。</div>
      </div>
      {doctorVisibleNotice ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-400">
          医疗协同状态：{doctorVisibleNotice}
        </div>
      ) : null}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">数据接入</div>
        <div className="mt-2 text-xs text-slate-400">接入真实设备、实时网关，或在需要时切换到 Mock 模式。当前数据源：{dataSourceType}</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { type: 'ble', label: '真实设备' },
            { type: 'websocket', label: '实时网关' },
            { type: 'mock', label: 'Mock' }
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
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="实时网关地址"
            />
            <input
              value={sourceConfig.websocket.authToken}
              onChange={(event) => patchSourceConfig('websocket', { authToken: event.target.value })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="鉴权 token（可选）"
            />
          </div>
        ) : null}
        {dataSourceType === 'ble' ? (
          <div className="mt-3 space-y-2">
            <input
              value={sourceConfig.ble.deviceId}
              onChange={(event) => patchSourceConfig('ble', { deviceId: event.target.value })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="设备 ID"
            />
            <input
              value={sourceConfig.ble.serviceUuid}
              onChange={(event) => patchSourceConfig('ble', { serviceUuid: event.target.value })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="服务 UUID"
            />
            <input
              value={sourceConfig.ble.characteristicUuid}
              onChange={(event) => patchSourceConfig('ble', { characteristicUuid: event.target.value })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="特征 UUID"
            />
          </div>
        ) : null}
        {dataSourceType === 'mock' ? (
          <div className="mt-3 space-y-2">
            <select
              value={sourceConfig.mock.scenario}
              onChange={(event) => patchSourceConfig('mock', { scenario: event.target.value })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {mockScenarios.map((scenario) => (
                <option key={scenario.code} value={scenario.code}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={200}
              step={100}
              value={sourceConfig.mock.intervalMs}
              onChange={(event) => patchSourceConfig('mock', { intervalMs: Math.max(200, Number(event.target.value) || 1000) })}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="数据间隔（ms）"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
