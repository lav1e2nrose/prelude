import { SENSITIVE_COPY } from '../../i18n/sensitive-copy'
import { useMemorialStore } from '../../store/memorial'

export const MemorialModeBanner = () => {
  const memorial = useMemorialStore((state) => state.memorial)
  const enterMemorialMode = useMemorialStore((state) => state.enterMemorialMode)
  const exitMemorialMode = useMemorialStore((state) => state.exitMemorialMode)

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--bg-2)] p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">记忆模式</div>
      {!memorial.enabled ? (
        <div className="mt-3">
          <div className="text-sm font-semibold text-white">{SENSITIVE_COPY.memorialMode.entryTitle}</div>
          <p className="mt-2 text-sm text-slate-300">{SENSITIVE_COPY.memorialMode.entryBody}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => enterMemorialMode('patient')}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm"
            >
              {SENSITIVE_COPY.memorialMode.entryPrimary}
            </button>
            <button type="button" className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              {SENSITIVE_COPY.memorialMode.entrySecondary}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="text-sm font-semibold text-white">当前处于静默模式</div>
          <p className="mt-2 text-sm text-slate-300">系统已暂停所有提示与家属通知。</p>
          <button
            type="button"
            onClick={exitMemorialMode}
            className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            {SENSITIVE_COPY.memorialMode.revokePrimary}
          </button>
        </div>
      )}
    </div>
  )
}
