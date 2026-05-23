import { StatusOrb } from '../../components/shared/StatusOrb'
import { FalsePositiveFeedback } from '../../components/shared/FalsePositiveFeedback'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { MockModeBanner } from '../../components/shared/MockModeBanner'
import { useAlertsStore } from '../../store'
import { useRealtimeStore } from '../../store'

export const HomeStatus = () => {
  const alerts = useAlertsStore((state) => state.alerts)
  const createDemoAlert = useAlertsStore((state) => state.createDemoAlert)
  const markFalsePositive = useAlertsStore((state) => state.markFalsePositive)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const latestAlert = alerts[0]
  const pendingAlerts = alerts.filter((alert) => !alert.acknowledged).length

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">患者概览</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">小雅 · 孕 32 周 3 天</div>
            <p className="mt-2 text-sm text-slate-300">
              当前处于高危妊娠随访期，监测数据已自动同步至家属与医生端。
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1">
                待处理预警 {pendingAlerts} 条
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1">
                下一次复查 05-29
              </span>
            </div>
          </div>
          <StatusOrb level={latestAlert?.level ?? 'attention'} label="实时风险状态" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            {
              label: '母体心率',
              value: latestFrame ? `${latestFrame.maternalHR} bpm` : '--',
              hint: latestFrame ? '实时' : '待连接'
            },
            {
              label: '胎心率',
              value: latestFrame?.fetalHR ? `${latestFrame.fetalHR} bpm` : '--',
              hint: latestFrame?.fetalHR ? '实时' : '待连接'
            },
            {
              label: '电极质量',
              value: latestFrame ? `${latestFrame.electrodeQuality}%` : '--',
              hint: latestFrame ? '实时' : '待连接'
            },
            {
              label: '设备链路',
              value: connectionStatus,
              hint: connectionStatus === 'connected' || connectionStatus === 'mock' ? '稳定' : '检查连接'
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2"
            >
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{item.value}</div>
              <div className="text-[11px] text-slate-400">{item.hint}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => createDemoAlert('attention')}
            className="rounded-[var(--radius-control)] border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-500/15"
          >
            模拟轻度预警
          </button>
          <button
            type="button"
            onClick={() => createDemoAlert('alert')}
            className="rounded-[var(--radius-control)] border border-[var(--alert)]/30 bg-[var(--alert)]/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-[var(--alert)]/15"
          >
            模拟高风险预警
          </button>
          <button
            type="button"
            onClick={() => createDemoAlert('emergency')}
            className="rounded-[var(--radius-control)] border border-[var(--critical)]/40 bg-[var(--critical)]/15 px-4 py-2 text-sm text-rose-100 transition hover:bg-[var(--critical)]/20"
          >
            模拟紧急状态
          </button>
        </div>
      </section>

      {latestAlert ? (
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">最近一次预警</div>
          <div className="mt-2 text-base font-semibold text-[var(--text-primary)]">{latestAlert.summary}</div>
          <div className="mt-2 text-xs text-slate-400">
            {new Date(latestAlert.createdAt).toLocaleString('zh-CN')} · 等级 {latestAlert.level}
          </div>
          <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-3 py-2 text-xs text-slate-300">
            建议：保持左侧卧，减少体位变化。如出现规律宫缩，请立即联系医生。
          </div>
          <div className="mt-4">
            <FalsePositiveFeedback onFeedback={() => markFalsePositive(latestAlert.id)} />
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">今日监测计划</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>14:00-16:00 卧床休息，保持左侧卧</li>
            <li>18:30 进行 15 分钟呼吸训练</li>
            <li>22:00 发送晚间状态给家属与医生</li>
          </ul>
        </div>
        <MockModeBanner />
        <MemorialModeBanner />
      </div>
    </div>
  )
}
