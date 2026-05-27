import { useMemo, useState } from 'react'
import { FalsePositiveFeedback } from '../../components/shared/FalsePositiveFeedback'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { MockModeBanner } from '../../components/shared/MockModeBanner'
import { StatusOrb } from '../../components/shared/StatusOrb'
import { useAlertsStore, useMemorialStore, useMemorialWorkflowStore, usePatientJournalStore, useRealtimeStore } from '../../store'

const formatDelta = (value: number) => (value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`)

export const HomeStatus = () => {
  const [showProfessional, setShowProfessional] = useState(false)
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const patientVisibleNotice = useMemorialWorkflowStore((state) => state.patientVisibleNotice)
  const patientDelegationPendingChoice = useMemorialWorkflowStore((state) => state.patientDelegationPendingChoice)
  const resolveGuardianDelegation = useMemorialWorkflowStore((state) => state.resolveGuardianDelegation)
  const requestSupportHelp = useMemorialWorkflowStore((state) => state.requestSupportHelp)
  const alerts = useAlertsStore((state) => state.alerts)
  const createDemoAlert = useAlertsStore((state) => state.createDemoAlert)
  const markFalsePositive = useAlertsStore((state) => state.markFalsePositive)
  const latestFrame = useRealtimeStore((state) => state.latestFrame)
  const frameBuffer = useRealtimeStore((state) => state.frameBuffer)
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus)
  const contractions = usePatientJournalStore((state) => state.contractions)
  const fetalMovements = usePatientJournalStore((state) => state.fetalMovements)
  const addTimelineEvent = usePatientJournalStore((state) => state.addTimelineEvent)
  const latestAlert = alerts[0]
  const pendingAlerts = alerts.filter((alert) => !alert.acknowledged).length

  const startOfDay = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.getTime()
  }, [])

  const todayContractions = contractions.filter((item) => item.timestamp >= startOfDay)
  const todayFetalMovements = fetalMovements.filter((item) => item.timestamp >= startOfDay)

  const recentRisk = frameBuffer.slice(-30).map((item) => item.pretermRiskScore)
  const minRisk = recentRisk.length > 0 ? Math.min(...recentRisk) : 0
  const maxRisk = recentRisk.length > 0 ? Math.max(...recentRisk) : 1
  const riskRange = Math.max(0.001, maxRisk - minRisk)
  const trendPoints = recentRisk
    .map((risk, index) => {
      const x = (index / Math.max(1, recentRisk.length - 1)) * 100
      const y = 100 - ((risk - minRisk) / riskRange) * 100
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const risk24h = latestFrame?.features.pretermProbability24h ?? 2.1
  const risk7d = latestFrame?.features.pretermProbability7d ?? 5.8
  const prevRisk24h = frameBuffer.at(-2)?.features.pretermProbability24h ?? risk24h
  const prevRisk7d = frameBuffer.at(-2)?.features.pretermProbability7d ?? risk7d

  const statusCopy =
    latestFrame?.riskLevel === 'safe'
      ? '平稳'
      : latestFrame?.riskLevel === 'attention'
        ? '需关注'
        : latestFrame?.riskLevel === 'alert'
          ? '风险升高'
          : '紧急'

  if (memorialEnabled) {
    return (
      <div className="space-y-6">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-6 shadow-[var(--shadow-card)]">
          <MemorialModeBanner compactWhenEnabled />
          <div className="flex min-h-[380px] items-center justify-center">
            <div className="max-w-xl text-center">
              <div className="text-3xl font-semibold text-[var(--text-primary)]">您好</div>
              <p className="mt-4 text-sm leading-8 text-slate-400">如果您想做些什么，可以从左侧菜单进入。</p>
              {patientVisibleNotice ? (
                <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3 text-left text-sm text-slate-300">
                  {patientVisibleNotice}
                </div>
              ) : null}
              {patientDelegationPendingChoice ? (
                <div className="mt-4 space-y-2 text-left">
                  <button
                    type="button"
                    onClick={() => resolveGuardianDelegation('keep_pause')}
                    className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-slate-200"
                  >
                    继续保持暂停状态
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveGuardianDelegation('self_decide')}
                    className="w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-slate-300"
                  >
                    我想自己决定该怎么处理
                  </button>
                  <div className="text-xs text-slate-500">无论您选择什么，都不会有人收到通知。</div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={requestSupportHelp}
                className="mt-6 text-xs text-[var(--text-muted)] underline underline-offset-4"
              >
                需要帮助？联系我们 →
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">首页状态</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">上午好，小雅</div>
            <p className="mt-2 text-sm text-slate-300">孕 32 周 + 3 天 · 距离预产期还有 7 周 + 4 天</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1">
                待处理预警 {pendingAlerts} 条
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1">
                今日宫缩 {todayContractions.length} 次
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2 py-1">
                今日胎动 {todayFetalMovements.length} 次
              </span>
            </div>
          </div>
          <StatusOrb level={latestAlert?.level ?? latestFrame?.riskLevel ?? 'attention'} label={`实时风险状态 · ${statusCopy}`} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-4 py-4">
            <div className="text-xs text-slate-400">本周风险趋势</div>
            <div className="mt-2 h-24 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)]/70 p-2">
              {trendPoints ? (
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <polyline points={trendPoints} fill="none" stroke="var(--alert)" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">等待实时数据</div>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-400">过去 4 小时未检测到规律高风险宫缩，数据已同步家属与医生端。</div>
          </div>

          <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-4 py-4">
            <div className="text-xs text-slate-400">今日进度</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">2h 18m / 4h</div>
            <div className="mt-2 h-2 rounded-full bg-[var(--bg-1)]">
              <div className="h-full rounded-full bg-[var(--safe)]" style={{ width: '58%' }} />
            </div>
            <div className="mt-2 text-xs text-slate-400">建议晚间补充 1 次 40 分钟监测</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              createDemoAlert('attention')
              addTimelineEvent('风险提醒', '触发轻度预警演示')
            }}
            className="min-h-[52px] rounded-[var(--radius-control)] border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-500/15"
          >
            模拟轻度预警
          </button>
          <button
            type="button"
            onClick={() => {
              createDemoAlert('alert')
              addTimelineEvent('风险提醒', '触发高风险预警演示')
            }}
            className="min-h-[52px] rounded-[var(--radius-control)] border border-[var(--alert)]/30 bg-[var(--alert)]/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-[var(--alert)]/15"
          >
            模拟高风险预警
          </button>
          <button
            type="button"
            onClick={() => {
              addTimelineEvent('症状记录', '患者主动记录：腹部紧绷（约 3 分钟）')
            }}
            className="min-h-[52px] rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-2 text-sm text-slate-200 transition hover:border-[var(--border-default)]"
          >
            记录症状：腹部紧绷
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowProfessional((prev) => !prev)}
          className="mt-4 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3 text-left text-sm text-slate-300"
        >
          ⚙ 专业模式（{showProfessional ? '收起' : '展开'}）
        </button>

        {showProfessional ? (
          <div className="mt-3 grid gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-slate-400">当前 24h 早产概率</div>
              <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {risk24h.toFixed(1)}% <span className="text-sm text-slate-400">{formatDelta(risk24h - prevRisk24h)}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">当前 7d 早产概率</div>
              <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {risk7d.toFixed(1)}% <span className="text-sm text-slate-400">{formatDelta(risk7d - prevRisk7d)}</span>
              </div>
            </div>
            <div className="text-xs text-slate-300">
              宫缩频率：{latestFrame?.features.contractionsPerHour.toFixed(1) ?? '1.4'} 次/h
            </div>
            <div className="text-xs text-slate-300">
              传播速度：{latestFrame?.features.contractionPropagationVelocity.toFixed(1) ?? '2.1'} cm/s
            </div>
            <div className="text-xs text-slate-300">中值频率：{latestFrame?.features.medianFrequency.toFixed(2) ?? '0.38'} Hz</div>
            <div className="text-xs text-slate-300">链路状态：{connectionStatus}</div>
          </div>
        ) : null}
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
        <MemorialModeBanner defaultExpandedWhenEnabled />
      </div>
      <footer className="pt-2">
        <button
          type="button"
          onClick={requestSupportHelp}
          className="text-xs text-[var(--text-muted)] underline underline-offset-4"
        >
          需要帮助？联系我们 →
        </button>
      </footer>
    </div>
  )
}
