import { useMemo, useState } from 'react'
import { EmergencyOverlay } from '../../components/shared/EmergencyOverlay'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { type AdverseOutcomeType } from '../../types/memorial'
import { useMemorialStore, useMemorialWorkflowStore, useRealtimeStore } from '../../store'

const outcomeOptions: Array<{ value: AdverseOutcomeType | 'skip'; label: string }> = [
  { value: 'skip', label: '不告诉系统发生了什么（跳过）' },
  { value: 'early_miscarriage', label: '早期妊娠终止' },
  { value: 'late_miscarriage', label: '中晚期妊娠终止' },
  { value: 'iufd', label: 'IUFD（胎死宫内）' },
  { value: 'medical_termination', label: '医学原因终止妊娠' },
  { value: 'selective_reduction', label: '选择性减胎' },
  { value: 'neonatal_death', label: '新生儿离世' },
  { value: 'unknown', label: '其他未分类原因' }
]

export const PatientSettings = () => {
  const memorial = useMemorialStore((state) => state.memorial)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const patchSourceConfig = useRealtimeStore((state) => state.patchSourceConfig)
  const setDataSourceType = useRealtimeStore((state) => state.setDataSourceType)

  const inactivityDays = useMemorialWorkflowStore((state) => state.inactivityDays)
  const passivePromptVisible = useMemorialWorkflowStore((state) => state.passivePromptVisible)
  const passiveEmailSent = useMemorialWorkflowStore((state) => state.passiveEmailSent)
  const historyAccessConfirmed = useMemorialWorkflowStore((state) => state.historyAccessConfirmed)
  const pendingHistoryConfirm = useMemorialWorkflowStore((state) => state.pendingHistoryConfirm)
  const deletionState = useMemorialWorkflowStore((state) => state.deletionState)
  const hardDeleteAt = useMemorialWorkflowStore((state) => state.hardDeleteAt)
  const legalRetentionYears = useMemorialWorkflowStore((state) => state.legalRetentionYears)
  const currentPregnancyMode = useMemorialWorkflowStore((state) => state.currentPregnancyMode)
  const pregnancyVersion = useMemorialWorkflowStore((state) => state.pregnancyVersion)
  const patientVisibleNotice = useMemorialWorkflowStore((state) => state.patientVisibleNotice)
  const triggerLog = useMemorialWorkflowStore((state) => state.triggerLog)
  const setInactivityDays = useMemorialWorkflowStore((state) => state.setInactivityDays)
  const requestHistoryAccess = useMemorialWorkflowStore((state) => state.requestHistoryAccess)
  const cancelHistoryAccess = useMemorialWorkflowStore((state) => state.cancelHistoryAccess)
  const confirmHistoryAccess = useMemorialWorkflowStore((state) => state.confirmHistoryAccess)
  const triggerPatientInitiatedMemorial = useMemorialWorkflowStore((state) => state.triggerPatientInitiatedMemorial)
  const recoverSoftDeletedData = useMemorialWorkflowStore((state) => state.recoverSoftDeletedData)
  const startNewPregnancy = useMemorialWorkflowStore((state) => state.startNewPregnancy)
  const requestSupportHelp = useMemorialWorkflowStore((state) => state.requestSupportHelp)

  const [dailySummary, setDailySummary] = useState(true)
  const [postureReminder, setPostureReminder] = useState(true)
  const [nightMode, setNightMode] = useState(false)
  const [entryVisible, setEntryVisible] = useState(false)
  const [entryChoice, setEntryChoice] = useState<'pause_keep_data' | 'export_and_delete' | 'not_ready'>('pause_keep_data')
  const [outcomeType, setOutcomeType] = useState<AdverseOutcomeType | 'skip'>('skip')
  const [newPregnancyChoice, setNewPregnancyChoice] = useState<'fresh_start' | 'reuse_history' | 'undecided'>('undecided')

  const hardDeleteText = useMemo(() => {
    if (!hardDeleteAt) return '未安排'
    return new Date(hardDeleteAt).toLocaleString('zh-CN')
  }, [hardDeleteAt])

  const submitPatientChannel = () => {
    if (entryChoice === 'not_ready') {
      setEntryVisible(false)
      return
    }
    const mappedOutcome = outcomeType === 'skip' ? null : outcomeType
    triggerPatientInitiatedMemorial(entryChoice, mappedOutcome)
    setEntryVisible(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 text-xs text-slate-400">主要联系人：陈先生</div>
        <div className="mt-2 text-xs text-slate-400">静默模式：{memorial.enabled ? '已开启' : '未开启'}</div>
        <div className="mt-2 text-xs text-slate-400">当前孕程：第 {pregnancyVersion} 次 · 模式 {currentPregnancyMode}</div>
        {patientVisibleNotice ? <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-300">{patientVisibleNotice}</div> : null}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-300">关于结束这段孕程</div>
            <div className="mt-2 text-xs leading-6 text-slate-400">
              您可以暂停提醒并保留数据，或导出后进入删除流程。您也可以暂不做选择。
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEntryVisible(true)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
          >
            关于结束这段孕程 →
          </button>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">异常停用引导（通道 B）</div>
        <div className="mt-3 text-xs text-slate-400">仅在用户主动打开 App 时展示，不触发 push。</div>
        <div className="mt-4">
          <div className="text-xs text-slate-400">连续未使用 {inactivityDays} 天</div>
          <input
            type="range"
            min={0}
            max={45}
            value={inactivityDays}
            onChange={(event) => setInactivityDays(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          <div>8-14 天：中性问候 + 可跳过状态调整提示 {passivePromptVisible ? '（当前可见）' : '（当前隐藏）'}</div>
          <div>&gt;30 天：仅发送一次中性邮件 {passiveEmailSent ? '（已触发）' : '（未触发）'}</div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">通知与提醒</div>
        {memorial.enabled ? (
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-3 text-sm text-slate-400">
            当前已暂停主动提醒与提示音。如需查看历史数据，请从下方“查看历史数据”手动进入。
          </div>
        ) : (
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
        )}
      </div>

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">历史数据访问</div>
          <div className="mt-2 text-xs text-slate-400">默认隐藏历史数据入口。仅在您主动确认后，相关页面才显示历史记录。</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestHistoryAccess}
              className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
            >
              查看历史数据
            </button>
            <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-400">
              状态：{historyAccessConfirmed ? '已解锁本次访问' : '未解锁'}
            </div>
            <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-400">
              我需要这些数据（导出二级入口）
            </button>
          </div>
        </div>
      ) : null}

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">我有了新的开始</div>
          <div className="mt-2 text-xs text-slate-400">系统不会主动检测，只有您主动选择时才开启新孕程。</div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name="new-pregnancy"
                checked={newPregnancyChoice === 'fresh_start'}
                onChange={() => setNewPregnancyChoice('fresh_start')}
              />
              全新开始（患者端不显示任何既往引用）
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name="new-pregnancy"
                checked={newPregnancyChoice === 'reuse_history'}
                onChange={() => setNewPregnancyChoice('reuse_history')}
              />
              参考之前的数据（医生端仍可见完整历史）
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name="new-pregnancy"
                checked={newPregnancyChoice === 'undecided'}
                onChange={() => setNewPregnancyChoice('undecided')}
              />
              我还在考虑
            </label>
          </div>
          <button
            type="button"
            onClick={() => startNewPregnancy(newPregnancyChoice)}
            className="mt-4 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-sm text-white"
          >
            应用选择
          </button>
        </div>
      ) : null}

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">数据时间胶囊</div>
        <div className="mt-2 text-xs text-slate-400">
          当前状态：{deletionState} · 法定保留期 {legalRetentionYears} 年 · 硬删除时间：{hardDeleteText}
        </div>
        {deletionState === 'soft_deleted' ? (
          <button
            type="button"
            onClick={recoverSoftDeletedData}
            className="mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
          >
            在 30 天内恢复账户
          </button>
        ) : null}
        {deletionState === 'hard_deleted' ? (
          <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-400">
            App 端数据已硬删除。医疗机构依法保留数据可用于法定访问。
          </div>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">数据接入</div>
        <div className="mt-2 text-xs text-slate-400">用于接入真实设备、实时网关，或在需要时切换到 Mock 剧本。当前数据源：{dataSourceType}</div>
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
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">需要帮助？联系我们</div>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          <div>电话：400-XXX-XXXX（9:00-21:00）</div>
          <div>邮箱：support@zhiwei.health</div>
          <div>您不需要解释具体情况，只需告诉我们希望我们做什么。</div>
        </div>
        <button
          type="button"
          onClick={requestSupportHelp}
          className="mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200"
        >
          记录客服求助通道（E）
        </button>
      </div>

      {triggerLog.length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">通道触发日志（A-E）</div>
          <div className="mt-3 space-y-2 text-xs text-slate-400">
            {triggerLog.slice(0, 8).map((item) => (
              <div key={item.id}>
                {new Date(item.timestamp).toLocaleString('zh-CN')} · 通道 {item.channel} · {item.detail}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <MemorialModeBanner defaultExpandedWhenEnabled />

      <EmergencyOverlay
        visible={entryVisible}
        title="关于结束这段孕程"
        description="您可以暂停一切提醒并保留数据，或导出数据后进入 30 天恢复窗口。您也可以暂不做选择。"
        confirmText="应用当前选择"
        cancelText="取消"
        onDismiss={submitPatientChannel}
        onCancel={() => setEntryVisible(false)}
      />
      {entryVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto mt-24 w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs text-slate-400">请选择操作</div>
            <div className="mt-2 space-y-2 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="entry-choice"
                  checked={entryChoice === 'pause_keep_data'}
                  onChange={() => setEntryChoice('pause_keep_data')}
                />
                暂停一切提醒，保留数据
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="entry-choice"
                  checked={entryChoice === 'export_and_delete'}
                  onChange={() => setEntryChoice('export_and_delete')}
                />
                导出数据后注销
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="entry-choice"
                  checked={entryChoice === 'not_ready'}
                  onChange={() => setEntryChoice('not_ready')}
                />
                我还没准备好做选择
              </label>
            </div>
            <div className="mt-3 text-xs text-slate-400">您愿意告诉我们发生了什么吗？（完全自愿，可跳过）</div>
            <select
              value={outcomeType}
              onChange={(event) => setOutcomeType(event.target.value as AdverseOutcomeType | 'skip')}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]"
            >
              {outcomeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <EmergencyOverlay
        visible={pendingHistoryConfirm}
        title="查看历史数据"
        description="您将查看既往监测数据。是否继续？"
        confirmText="继续"
        cancelText="取消"
        onDismiss={confirmHistoryAccess}
        onCancel={cancelHistoryAccess}
      />
    </div>
  )
}
