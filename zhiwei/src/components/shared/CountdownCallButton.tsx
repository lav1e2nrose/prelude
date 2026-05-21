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
      className="rounded-xl bg-[var(--alert)] px-4 py-2 text-sm font-semibold"
    >
      {countdown === null ? label : `即将执行 (${countdown}s) — 点击取消`}
    </button>
  )
}
