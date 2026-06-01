import { useEffect, useRef, useState } from 'react'
import type { ToastItem, ToastKind } from '../../store/toast'
import { useToastStore } from '../../store/toast'

const kindStyle: Record<ToastKind, { bar: string; icon: string }> = {
  info: { bar: 'bg-[var(--accent)]', icon: 'ⓘ' },
  success: { bar: 'bg-[var(--safe)]', icon: '✓' },
  attention: { bar: 'bg-[var(--attention)]', icon: '!' },
  alert: { bar: 'bg-[var(--alert)]', icon: '⚠' }
}

const ToastCard = ({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) => {
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<number | null>(null)

  const close = () => {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => onDismiss(toast.id), 240)
  }

  useEffect(() => {
    if (toast.duration <= 0) return
    timerRef.current = window.setTimeout(close, toast.duration)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration])

  const style = kindStyle[toast.kind]

  return (
    <div
      className={`pointer-events-auto flex w-80 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 shadow-[var(--shadow-card)] backdrop-blur ${
        leaving ? 'toast-out' : 'toast-in'
      }`}
      role="status"
    >
      <div className={`w-1 flex-shrink-0 ${style.bar}`} />
      <div className="flex flex-1 items-start gap-3 px-3 py-3">
        <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs text-white ${style.bar}`}>
          {style.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</div>
          {toast.description ? <div className="mt-0.5 text-xs leading-5 text-slate-400">{toast.description}</div> : null}
        </div>
        <button type="button" onClick={close} className="ml-1 text-slate-500 transition hover:text-slate-300">
          ×
        </button>
      </div>
    </div>
  )
}

export const ToastHost = () => {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
