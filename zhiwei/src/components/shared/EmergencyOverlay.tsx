interface EmergencyOverlayProps {
  visible: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onDismiss?: () => void
  onCancel?: () => void
}

export const EmergencyOverlay = ({
  visible,
  title,
  description,
  confirmText = '我知道了',
  cancelText,
  onDismiss,
  onCancel
}: EmergencyOverlayProps) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-3 text-sm text-slate-300">{description}</p>
        <div className="mt-6 flex gap-3">
          {cancelText ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] py-2 text-sm font-medium text-slate-200"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-[var(--radius-control)] bg-[var(--accent)] py-2 text-sm font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
