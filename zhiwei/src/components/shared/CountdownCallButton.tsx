import { useEffect, useState } from 'react'

interface CountdownCallButtonProps {
  label: string
  onConfirm?: () => void
}

export const CountdownCallButton = ({ label, onConfirm }: CountdownCallButtonProps) => {
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (countdown === null) return
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        onConfirm?.()
        setCountdown(null)
        return
      }
      setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown, onConfirm])

  return (
    <button
      type="button"
      onClick={() => setCountdown((prev) => (prev === null ? 3 : null))}
      className={`rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold ${
        countdown === null
          ? 'border-[var(--alert)]/40 bg-[var(--alert)]/15 text-[var(--text-primary)]'
          : 'border-[var(--critical)]/50 bg-[var(--critical)]/20 text-white'
      }`}
    >
      {countdown === null ? label : `即将执行 (${countdown}s) — 点击取消`}
    </button>
  )
}
