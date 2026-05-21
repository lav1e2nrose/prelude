import { StatusOrb } from '../../components/shared/StatusOrb'
import { FalsePositiveFeedback } from '../../components/shared/FalsePositiveFeedback'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { MockModeBanner } from '../../components/shared/MockModeBanner'
import { useAlertsStore } from '../../store'

export const HomeStatus = () => {
  const alerts = useAlertsStore((state) => state.alerts)
  const createDemoAlert = useAlertsStore((state) => state.createDemoAlert)
  const markFalsePositive = useAlertsStore((state) => state.markFalsePositive)
  const latestAlert = alerts[0]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[var(--bg-1)]/90 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">患者概览</div>
            <div className="mt-2 text-2xl font-semibold text-white">小雅 · 孕 32 周 3 天</div>
            <p className="mt-2 text-sm text-slate-300">建议保持左侧卧姿势，已同步家属端与医生端实时状态。</p>
          </div>
          <StatusOrb level={latestAlert?.level ?? 'attention'} label="实时风险状态" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => createDemoAlert('attention')}
            className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-500/15"
          >
            模拟轻度预警
          </button>
          <button
            type="button"
            onClick={() => createDemoAlert('alert')}
            className="rounded-xl border border-[var(--alert)]/30 bg-[var(--alert)]/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-[var(--alert)]/15"
          >
            模拟高风险预警
          </button>
          <button
            type="button"
            onClick={() => createDemoAlert('emergency')}
            className="rounded-xl border border-[var(--critical)]/40 bg-[var(--critical)]/15 px-4 py-2 text-sm text-rose-100 transition hover:bg-[var(--critical)]/20"
          >
            模拟紧急状态
          </button>
        </div>
      </section>

      {latestAlert ? (
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">最近一次预警</div>
          <div className="mt-2 text-base font-semibold text-white">{latestAlert.summary}</div>
          <div className="mt-2 text-xs text-slate-400">
            {new Date(latestAlert.createdAt).toLocaleString('zh-CN')} · 等级 {latestAlert.level}
          </div>
          <div className="mt-4">
            <FalsePositiveFeedback onFeedback={() => markFalsePositive(latestAlert.id)} />
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <MockModeBanner />
        <MemorialModeBanner />
      </div>
    </div>
  )
}
