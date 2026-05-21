interface EmergencyOverlayProps {
  visible: boolean
  title: string
  description: string
  onDismiss?: () => void
}

export const EmergencyOverlay = ({ visible, title, description, onDismiss }: EmergencyOverlayProps) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-1)] p-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-3 text-sm text-slate-300">{description}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-2 text-sm font-semibold"
        >
          我知道了
        </button>
      </div>
    </div>
  )
}
