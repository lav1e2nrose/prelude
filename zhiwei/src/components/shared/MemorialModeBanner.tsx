import { useMemo, useState } from 'react'
import { SENSITIVE_COPY } from '../../i18n/sensitive-copy'
import { useMemorialStore } from '../../store/memorial'
import { EmergencyOverlay } from './EmergencyOverlay'

export const MemorialModeBanner = () => {
  const memorial = useMemorialStore((state) => state.memorial)
  const enterMemorialMode = useMemorialStore((state) => state.enterMemorialMode)
  const exitMemorialMode = useMemorialStore((state) => state.exitMemorialMode)
  const updateMemorialNote = useMemorialStore((state) => state.updateMemorialNote)
  const setFutureReuse = useMemorialStore((state) => state.setFutureReuse)
  const [confirmMode, setConfirmMode] = useState<'enter' | 'exit' | null>(null)

  const undoText = useMemo(() => {
    if (!memorial.canUndoUntil) return null
    return new Date(memorial.canUndoUntil).toLocaleString('zh-CN')
  }, [memorial.canUndoUntil])

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-2)]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">记忆模式</div>
        {!memorial.enabled ? (
          <div className="mt-3">
            <div className="text-sm font-semibold text-white">{SENSITIVE_COPY.memorialMode.entryTitle}</div>
            <p className="mt-2 text-sm text-slate-300">{SENSITIVE_COPY.memorialMode.entryBody}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmMode('enter')}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white"
              >
                {SENSITIVE_COPY.memorialMode.entryPrimary}
              </button>
              <button type="button" className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                {SENSITIVE_COPY.memorialMode.entrySecondary}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="text-sm font-semibold text-white">当前处于静默模式</div>
            <p className="text-sm text-slate-300">系统已暂停所有提示与家属通知，界面默认进入低刺激显示。</p>
            <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              可撤回截止：{undoText ?? '未设置'}
            </div>
            <label className="block text-xs text-slate-400">
              备注（仅本地）
              <textarea
                defaultValue={memorial.userNote ?? ''}
                onBlur={(event) => updateMemorialNote(event.target.value)}
                className="mt-2 h-20 w-full resize-none rounded-lg border border-white/10 bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFutureReuse(true)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200"
              >
                允许未来复用匿名数据
              </button>
              <button
                type="button"
                onClick={() => setFutureReuse(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200"
              >
                禁止未来复用匿名数据
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfirmMode('exit')}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm"
            >
              {SENSITIVE_COPY.memorialMode.revokePrimary}
            </button>
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
          enterMemorialMode('patient')
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
          setConfirmMode(null)
        }}
        onCancel={() => setConfirmMode(null)}
      />
    </>
  )
}
