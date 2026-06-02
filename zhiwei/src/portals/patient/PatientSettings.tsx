import { useMemo, useState } from 'react'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { type AdverseOutcomeType } from '../../types/memorial'
import {
  useMemorialStore,
  useMemorialWorkflowStore,
  useSettingsStore
} from '../../store'
import { applyDemoMode } from '../../store/demo'
import { confirmDialog } from '../../store/dialog'
import { toast } from '../../store/toast'
import { useCollaborationStore } from '../../store/collaboration'

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
  const demoMode = useSettingsStore((state) => state.demoMode)
  const setDemoMode = useSettingsStore((state) => state.setDemoMode)
  const setNotifications = useSettingsStore((state) => state.setNotifications)
  const notifications = useSettingsStore((state) => state.notifications)

  const inactivityDays = useMemorialWorkflowStore((state) => state.inactivityDays)
  const passivePromptVisible = useMemorialWorkflowStore((state) => state.passivePromptVisible)
  const passiveEmailSent = useMemorialWorkflowStore((state) => state.passiveEmailSent)
  const historyAccessConfirmed = useMemorialWorkflowStore((state) => state.historyAccessConfirmed)
  const deletionState = useMemorialWorkflowStore((state) => state.deletionState)
  const hardDeleteAt = useMemorialWorkflowStore((state) => state.hardDeleteAt)
  const legalRetentionYears = useMemorialWorkflowStore((state) => state.legalRetentionYears)
  const currentPregnancyMode = useMemorialWorkflowStore((state) => state.currentPregnancyMode)
  const pregnancyVersion = useMemorialWorkflowStore((state) => state.pregnancyVersion)
  const patientVisibleNotice = useMemorialWorkflowStore((state) => state.patientVisibleNotice)
  const triggerLog = useMemorialWorkflowStore((state) => state.triggerLog)
  const setInactivityDays = useMemorialWorkflowStore((state) => state.setInactivityDays)
  const requestHistoryAccess = useMemorialWorkflowStore((state) => state.requestHistoryAccess)
  const confirmHistoryAccess = useMemorialWorkflowStore((state) => state.confirmHistoryAccess)
  const triggerPatientInitiatedMemorial = useMemorialWorkflowStore((state) => state.triggerPatientInitiatedMemorial)
  const recoverSoftDeletedData = useMemorialWorkflowStore((state) => state.recoverSoftDeletedData)
  const startNewPregnancy = useMemorialWorkflowStore((state) => state.startNewPregnancy)
  const requestSupportHelp = useMemorialWorkflowStore((state) => state.requestSupportHelp)
  const primaryContactName = useCollaborationStore(
    (state) => state.guardians.find((g) => g.isPrimaryContact)?.name ?? '未设置'
  )

  const [entryVisible, setEntryVisible] = useState(false)
  const [entryChoice, setEntryChoice] = useState<'pause_keep_data' | 'export_and_delete' | 'not_ready'>('pause_keep_data')
  const [outcomeType, setOutcomeType] = useState<AdverseOutcomeType | 'skip'>('skip')
  const [newPregnancyChoice, setNewPregnancyChoice] = useState<'fresh_start' | 'reuse_history' | 'undecided'>('undecided')

  const hardDeleteText = useMemo(
    () => (hardDeleteAt ? new Date(hardDeleteAt).toLocaleString('zh-CN') : '未安排'),
    [hardDeleteAt]
  )

  const submitPatientChannel = () => {
    if (entryChoice === 'not_ready') {
      setEntryVisible(false)
      return
    }
    triggerPatientInitiatedMemorial(entryChoice, outcomeType === 'skip' ? null : outcomeType)
    setEntryVisible(false)
    toast.info('已为您调整账户状态', '已按您的选择处理，可随时在设置中恢复')
  }

  const handleDemoToggle = async () => {
    if (demoMode) {
      const ok = await confirmDialog({
        title: '关闭演示模式？',
        body: '关闭后将切换到真实数据模式：断开模拟设备、清空所有演示数据（监测记录/警报/协作）。真实模式下需连接真实设备与算法服务才会有数据。',
        confirmText: '切换到真实模式',
        cancelText: '保持演示',
        tone: 'danger'
      })
      if (!ok) return
      setDemoMode(false)
      applyDemoMode(false)
      toast.info('已切换到真实数据模式', '当前不展示任何模拟数据')
    } else {
      setDemoMode(true)
      applyDemoMode(true)
      toast.success('已开启演示模式', '已接入模拟设备与算法，波形与数据即时可见')
    }
  }

  const handleHistoryAccess = async () => {
    const ok = await confirmDialog({
      title: '查看历史数据',
      body: '您将查看既往监测数据。是否继续？',
      confirmText: '继续',
      cancelText: '取消'
    })
    if (ok) {
      requestHistoryAccess()
      confirmHistoryAccess()
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
          <div>主要联系人：{primaryContactName}</div>
          <div>静默模式：{memorial.enabled ? '已开启' : '未开启'}</div>
          <div>当前孕程：第 {pregnancyVersion} 次 · 模式 {currentPregnancyMode}</div>
        </div>
        {patientVisibleNotice ? (
          <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-300">{patientVisibleNotice}</div>
        ) : null}
      </div>

      {/* 演示模式（mock/真实 唯一切换入口） */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-300">演示模式</div>
            <div className="mt-2 text-xs leading-6 text-slate-400">
              开启：接入模拟设备与模拟算法，监测波形、宫缩、胎动、警报等全部即时可见，便于演示与联调。<br />
              关闭：切换到真实数据模式，仅展示来自真实设备与算法服务的数据，不残留任何模拟数据。
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoToggle}
            role="switch"
            aria-checked={demoMode}
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${demoMode ? 'bg-[var(--accent)]' : 'bg-[var(--bg-3)]'}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${demoMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px]"
          style={{ borderColor: demoMode ? 'rgba(201,152,70,0.3)' : 'rgba(91,140,90,0.3)', color: demoMode ? 'var(--attention)' : 'var(--safe)' }}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: demoMode ? 'var(--attention)' : 'var(--safe)' }} />
          当前：{demoMode ? '演示模式（模拟数据）' : '真实数据模式'}
        </div>
      </div>

      {/* 通知与提醒 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">通知与提醒</div>
        {memorial.enabled ? (
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-3 text-sm text-slate-400">
            当前已暂停主动提醒与提示音。如需查看历史数据，请从下方手动进入。
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              { key: 'dailySummary' as const, label: '每日摘要推送' },
              { key: 'postureReminder' as const, label: '体位提醒' },
              { key: 'nightLowStimulus' as const, label: '夜间低刺激显示' }
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2">
                <span>{item.label}</span>
                <input type="checkbox" checked={notifications[item.key]} onChange={() => setNotifications({ [item.key]: !notifications[item.key] })} />
              </label>
            ))}
          </div>
        )}
      </div>

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">历史数据访问</div>
          <div className="mt-2 text-xs text-slate-400">默认隐藏历史数据入口。仅在您主动确认后，相关页面才显示历史记录。</div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleHistoryAccess} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200 transition hover:bg-[var(--bg-2)]">
              查看历史数据
            </button>
            <span className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-400">
              状态：{historyAccessConfirmed ? '已解锁本次访问' : '未解锁'}
            </span>
          </div>
        </div>
      ) : null}

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">我有了新的开始</div>
          <div className="mt-2 text-xs text-slate-400">系统不会主动检测，只有您主动选择时才开启新孕程。</div>
          <div className="mt-4 space-y-2">
            {([
              ['fresh_start', '全新开始（患者端不显示任何既往引用）'],
              ['reuse_history', '参考之前的数据（医生端仍可见完整历史）'],
              ['undecided', '我还在考虑']
            ] as const).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="radio" name="new-pregnancy" checked={newPregnancyChoice === value} onChange={() => setNewPregnancyChoice(value)} />
                {label}
              </label>
            ))}
          </div>
          <button type="button" onClick={() => { startNewPregnancy(newPregnancyChoice); toast.info('已更新孕程设置') }} className="mt-4 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-sm text-white">
            应用选择
          </button>
        </div>
      ) : null}

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">数据时间胶囊</div>
          <div className="mt-2 text-xs text-slate-400">当前状态：{deletionState} · 法定保留期 {legalRetentionYears} 年 · 硬删除时间：{hardDeleteText}</div>
          {deletionState === 'soft_deleted' ? (
            <button type="button" onClick={recoverSoftDeletedData} className="mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200">
              在 30 天内恢复账户
            </button>
          ) : null}
        </div>
      ) : null}

      {memorial.enabled ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">异常停用引导（通道 B）</div>
          <div className="mt-3 text-xs text-slate-400">连续未使用 {inactivityDays} 天 · 仅在主动打开 App 时展示，不触发推送。</div>
          <input type="range" min={0} max={45} value={inactivityDays} onChange={(e) => setInactivityDays(Number(e.target.value))} className="mt-2 w-full" />
          <div className="mt-2 text-xs text-slate-500">
            8-14 天中性问候 {passivePromptVisible ? '（可见）' : '（隐藏）'} · &gt;30 天一次性中性邮件 {passiveEmailSent ? '（已触发）' : '（未触发）'}
          </div>
        </div>
      ) : null}

      {/* 联系我们 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">需要帮助？联系我们</div>
        <div className="mt-3 space-y-1 text-xs text-slate-400">
          <div>电话：400-XXX-XXXX（9:00-21:00）</div>
          <div>邮箱：support@zhiwei.health</div>
          <div>您不需要解释具体情况，只需告诉我们希望我们做什么。</div>
        </div>
        <button type="button" onClick={() => { requestSupportHelp(); toast.info('已发起人工求助', '工作人员会尽快与您联系') }} className="mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-200">
          联系人工客服
        </button>
      </div>

      {/* 关于结束这段孕程（记忆模式入口，置于设置底部） */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-300">关于结束这段孕程</div>
            <div className="mt-2 text-xs leading-6 text-slate-400">您可以暂停一切提醒并保留数据，或导出后进入删除流程。您也可以暂不做选择。此操作可随时撤回。</div>
          </div>
          <button type="button" onClick={() => setEntryVisible(true)} className="flex-shrink-0 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-slate-300 transition hover:border-[var(--border-default)]">
            进入 →
          </button>
        </div>
      </div>

      {triggerLog.length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-sm text-slate-300">通道触发日志（A-E）</div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-400">
            {triggerLog.slice(0, 8).map((item) => (
              <div key={item.id}>{new Date(item.timestamp).toLocaleString('zh-CN')} · 通道 {item.channel} · {item.detail}</div>
            ))}
          </div>
        </div>
      ) : null}

      <MemorialModeBanner defaultExpandedWhenEnabled />

      {/* 结束孕程：单一清晰模态（可点击，不再卡死） */}
      {entryVisible ? (
        <div className="overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setEntryVisible(false)}>
          <div className="modal-in w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-card)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-[var(--text-primary)]">关于结束这段孕程</div>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              无论以何种方式，当您觉得这段旅程要结束时，您可以让"知微"停下来。请选择您希望的处理方式：
            </p>
            <div className="mt-4 space-y-2">
              {([
                ['pause_keep_data', '暂停一切提醒，保留数据', '停止所有通知、关闭警报系统、隐藏孕周显示；数据加密保存，可随时回来查看。'],
                ['export_and_delete', '导出数据后注销', '将全部数据打包导出，然后进入 30 天恢复窗口后彻底删除。'],
                ['not_ready', '我还没准备好做选择', '返回，无事发生。']
              ] as const).map(([value, label, desc]) => (
                <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5 transition ${entryChoice === value ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)]' : 'border-[var(--border-subtle)] bg-[var(--bg-2)]/60 hover:border-[var(--border-default)]'}`}>
                  <input type="radio" name="entry-choice" className="mt-1" checked={entryChoice === value} onChange={() => setEntryChoice(value)} />
                  <span>
                    <span className="block text-sm text-[var(--text-primary)]">{label}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
            {entryChoice !== 'not_ready' ? (
              <div className="mt-4">
                <div className="text-xs text-slate-400">您愿意告诉我们发生了什么吗？（完全自愿，可跳过）</div>
                <select value={outcomeType} onChange={(e) => setOutcomeType(e.target.value as AdverseOutcomeType | 'skip')} className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  {outcomeOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEntryVisible(false)} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] text-sm text-slate-200 transition hover:bg-[var(--bg-2)]">
                取消
              </button>
              <button type="button" onClick={submitPatientChannel} className="min-h-[44px] flex-1 rounded-[var(--radius-control)] bg-[var(--accent)] text-sm font-semibold text-white transition hover:brightness-110">
                {entryChoice === 'not_ready' ? '返回' : '应用当前选择'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
