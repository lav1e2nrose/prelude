import { useEffect } from 'react'
import { useDialogStore } from '../../store/dialog'

// 全局确认对话框宿主：替代原生 window.confirm，带遮罩淡入与卡片放大动画，支持 Esc 取消 / Enter 确认。
export const ConfirmHost = () => {
  const open = useDialogStore((state) => state.open)
  const options = useDialogStore((state) => state.options)
  const resolve = useDialogStore((state) => state.resolve)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolve(false)
      if (e.key === 'Enter') resolve(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, resolve])

  if (!open || !options) return null

  const danger = options.tone === 'danger'

  return (
    <div
      className="overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={() => resolve(false)}
    >
      <div
        className="modal-in w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{options.title}</h2>
        {options.body ? <p className="mt-3 text-sm leading-7 text-slate-300">{options.body}</p> : null}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => resolve(false)}
            className="min-h-[44px] flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] py-2 text-sm font-medium text-slate-200 transition hover:bg-[var(--bg-2)]"
          >
            {options.cancelText ?? '取消'}
          </button>
          <button
            type="button"
            onClick={() => resolve(true)}
            className={`min-h-[44px] flex-1 rounded-[var(--radius-control)] py-2 text-sm font-semibold text-white transition hover:brightness-110 ${
              danger ? 'bg-[var(--alert)]' : 'bg-[var(--accent)]'
            }`}
          >
            {options.confirmText ?? '确定'}
          </button>
        </div>
      </div>
    </div>
  )
}
