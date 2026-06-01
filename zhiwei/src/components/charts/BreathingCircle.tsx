import { useEffect, useState } from 'react'

// 引导呼吸节律：4 秒吸气 / 6 秒呼气，共 10 秒一个周期。
// 圆环随呼吸真实放大/缩小，文字与之同步切换，可作为孕妇放松练习。
const INHALE_MS = 4000
const EXHALE_MS = 6000
const CYCLE_MS = INHALE_MS + EXHALE_MS

export const BreathingCircle = () => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale')

  useEffect(() => {
    let exhaleTimer: number
    const tick = () => {
      setPhase('inhale')
      exhaleTimer = window.setTimeout(() => setPhase('exhale'), INHALE_MS)
    }
    tick()
    const cycle = window.setInterval(tick, CYCLE_MS)
    return () => {
      window.clearInterval(cycle)
      window.clearTimeout(exhaleTimer)
    }
  }, [])

  const inhaling = phase === 'inhale'

  return (
    <section className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-5">
      <div className="text-sm text-slate-300">呼吸节律引导</div>
      <div className="relative mt-5 flex h-40 w-40 items-center justify-center">
        {/* 外层光晕，随呼吸扩散 */}
        <div
          className="absolute rounded-full bg-[var(--safe)]/15"
          style={{
            height: inhaling ? '10rem' : '6rem',
            width: inhaling ? '10rem' : '6rem',
            transition: `all ${inhaling ? INHALE_MS : EXHALE_MS}ms cubic-bezier(0.37, 0, 0.63, 1)`
          }}
        />
        {/* 主体圆 */}
        <div
          className="relative flex items-center justify-center rounded-full border border-[var(--safe)]/40 bg-[var(--safe)]/25 text-sm font-medium text-[var(--text-primary)]"
          style={{
            height: inhaling ? '8rem' : '4.5rem',
            width: inhaling ? '8rem' : '4.5rem',
            transition: `all ${inhaling ? INHALE_MS : EXHALE_MS}ms cubic-bezier(0.37, 0, 0.63, 1)`
          }}
        >
          {inhaling ? '吸气' : '呼气'}
        </div>
      </div>
      <div className="mt-5 text-xs text-slate-400">
        跟随圆圈：放大时缓缓吸气 4 秒，缩小时缓缓呼气 6 秒
      </div>
    </section>
  )
}
