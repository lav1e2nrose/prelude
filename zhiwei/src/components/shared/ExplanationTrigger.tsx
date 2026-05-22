interface ExplanationTriggerProps {
  onClick?: () => void
}

export const ExplanationTrigger = ({ onClick }: ExplanationTriggerProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-default)] text-xs text-[var(--text-primary)]"
    >
      ⓘ
    </button>
  )
}
