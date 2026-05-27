import { useMemo, useState } from 'react'
import { SENSITIVE_COPY } from '../../i18n/sensitive-copy'
import { useMemorialWorkflowStore } from '../../store'
import { useMemorialStore } from '../../store/memorial'
import { EmergencyOverlay } from './EmergencyOverlay'

interface MemorialModeBannerProps {
  compactWhenEnabled?: boolean
  defaultExpandedWhenEnabled?: boolean
}

export const MemorialModeBanner = ({
  compactWhenEnabled = false,
  defaultExpandedWhenEnabled = false
}: MemorialModeBannerProps) => {
  const memorial = useMemorialStore((state) => state.memorial)
  const exitMemorialMode = useMemorialStore((state) => state.exitMemorialMode)
  const triggerPatientInitiatedMemorial = useMemorialWorkflowStore((state) => state.triggerPatientInitiatedMemorial)
  const markManualMemorialExit = useMemorialWorkflowStore((state) => state.markManualMemorialExit)
  const updateMemorialNote = useMemorialStore((state) => state.updateMemorialNote)
  const setFutureReuse = useMemorialStore((state) => state.setFutureReuse)
  const [confirmMode, setConfirmMode] = useState<'enter' | 'exit' | null>(null)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(defaultExpandedWhenEnabled)

  const undoText = useMemo(() => {
    if (!memorial.canUndoUntil) return null
    return new Date(memorial.canUndoUntil).toLocaleString('zh-CN')
  }, [memorial.canUndoUntil])

  const showCompactLayout = memorial.enabled && compactWhenEnabled

  return (
    <>
      <div
        className={
          showCompactLayout
            ? 'flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]'
            : 'rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/95 p-4 shadow-[var(--shadow-card)]'
        }
      >
        {!memorial.enabled ? (
          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{SENSITIVE_COPY.memorialMode.entryTitle}</div>
              <p className="mt-2 text-sm text-slate-300">{SENSITIVE_COPY.memorialMode.entryBody}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmMode('enter')}
                className="rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-sm text-white"
              >
                {SENSITIVE_COPY.memorialMode.entryPrimary}
              </button>
              <button type="button" className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-4 py-2 text-sm">
                {SENSITIVE_COPY.memorialMode.entrySecondary}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span>此账户处于静默模式</span>
              <button
                type="button"
                onClick={() => setIsDetailsExpanded((prev) => !prev)}
                className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
              >
                {isDetailsExpanded ? '收起' : '更改'}
              </button>
            </div>

            {isDetailsExpanded ? (
              <div
                className={
                  showCompactLayout
                    ? 'mt-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/90 p-4 text-sm text-slate-300'
                    : 'mt-4 space-y-3 text-sm text-slate-300'
                }
              >
                <div>当前已暂停提醒、提示音与协作通知。</div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-400">
                  可撤回截止：{undoText ?? '未设置'}
                </div>
                <label className="block text-xs text-slate-400">
                  备注（仅本地）
                  <textarea
                    defaultValue={memorial.userNote ?? ''}
                    onBlur={(event) => updateMemorialNote(event.target.value)}
                    className="mt-2 h-20 w-full resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFutureReuse(true)}
                    className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-200"
                  >
                    允许未来复用匿名数据
                  </button>
                  <button
                    type="button"
                    onClick={() => setFutureReuse(false)}
                    className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-slate-200"
                  >
                    禁止未来复用匿名数据
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmMode('exit')}
                    className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-4 py-2 text-xs text-slate-200"
                  >
                    {SENSITIVE_COPY.memorialMode.revokePrimary}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <EmergencyOverlay
        visible={confirmMode === 'enter'}
        title={SENSITIVE_COPY.memorialMode.confirmTitle}
        description={SENSITIVE_COPY.memorialMode.confirmBody}
        confirmText={SENSITIVE_COPY.memorialMode.confirmPrimary}
        cancelText={SENSITIVE_COPY.memorialMode.confirmSecondary}
        onDismiss={() => {
          triggerPatientInitiatedMemorial('pause_keep_data', null)
          setIsDetailsExpanded(true)
          setConfirmMode(null)
        }}
        onCancel={() => setConfirmMode(null)}
      />
      <EmergencyOverlay
        visible={confirmMode === 'exit'}
        title={SENSITIVE_COPY.memorialMode.revokeTitle}
        description={SENSITIVE_COPY.memorialMode.revokeBody}
        confirmText={SENSITIVE_COPY.memorialMode.revokePrimary}
        cancelText={SENSITIVE_COPY.memorialMode.revokeSecondary}
        onDismiss={() => {
          exitMemorialMode()
          markManualMemorialExit()
          setConfirmMode(null)
        }}
        onCancel={() => setConfirmMode(null)}
      />
    </>
  )
}
