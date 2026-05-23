import { useState } from 'react'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { useMemorialStore, useRealtimeStore } from '../../store'

export const PatientSettings = () => {
  const memorial = useMemorialStore((state) => state.memorial)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const patchSourceConfig = useRealtimeStore((state) => state.patchSourceConfig)
  const [dailySummary, setDailySummary] = useState(true)
  const [postureReminder, setPostureReminder] = useState(true)
  const [nightMode, setNightMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 text-xs text-slate-400">主要联系人：陈先生</div>
        <div className="mt-2 text-xs text-slate-400">静默模式：{memorial.enabled ? '已开启' : '未开启'}</div>
        <div className="mt-2 text-xs text-slate-400">
          数据复用偏好：
          {memorial.allowFutureReuse === null ? ' 未设置' : memorial.allowFutureReuse ? ' 允许匿名复用' : ' 禁止匿名复用'}
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">通知与提醒</div>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>每日摘要推送</span>
            <input type="checkbox" checked={dailySummary} onChange={() => setDailySummary((prev) => !prev)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>体位提醒</span>
            <input type="checkbox" checked={postureReminder} onChange={() => setPostureReminder((prev) => !prev)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
            <span>夜间低刺激显示</span>
            <input type="checkbox" checked={nightMode} onChange={() => setNightMode((prev) => !prev)} />
          </label>
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">实测接口参数</div>
        <div className="mt-2 text-xs text-slate-400">用于联调真实设备或实时网关。当前数据源：{dataSourceType}</div>
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
      </div>
      <MemorialModeBanner />
    </div>
  )
}
