import { getMockScenarioDefinition, mockScenarios } from '../data/mockScenarios'
import { type PortalType, useAppStore } from '../store'

const roleCards = [
  {
    id: 'patient' as PortalType,
    icon: '👩',
    title: '孕妇端',
    englishTitle: 'Mama',
    persona: '小雅 · 孕 32+3 周',
    subtitle: '个人风险与监测视图',
    description: '查看实时波形、宫缩趋势、今日任务与安抚式提醒。'
  },
  {
    id: 'guardian' as PortalType,
    icon: '👨',
    title: '家属端',
    englishTitle: 'Family',
    persona: '陈先生 · 丈夫',
    subtitle: '协作响应与分工看板',
    description: '统一查看状态变化、任务认领与远程协同响应。'
  },
  {
    id: 'doctor' as PortalType,
    icon: '⚕',
    title: '医生端',
    englishTitle: 'Doctor',
    persona: '王主任 · 产科',
    subtitle: '临床解释与决策覆盖',
    description: '查看患者队列、算法解释、病例对照与人工覆盖入口。'
  }
] as const

export const LoginScreen = () => {
  const setLoggedIn = useAppStore((state) => state.setLoggedIn)
  const portal = useAppStore((state) => state.portal)
  const setPortal = useAppStore((state) => state.setPortal)
  const mockScenario = useAppStore((state) => state.mockScenario)
  const setMockScenario = useAppStore((state) => state.setMockScenario)
  const currentScenario = getMockScenarioDefinition(mockScenario)

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[var(--alert)]/15 blur-[120px]" />
      <div className="w-full max-w-5xl rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop</div>
        <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">知微 · ZhīWēi</div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          见微知著，守护早产高危妈妈。进入不同角色视角，演示同一份监测数据如何在孕妇、家属与医生之间形成闭环。
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {roleCards.map((card) => {
            const active = portal === card.id
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setPortal(card.id)}
                className={`group rounded-[var(--radius-card)] border p-5 text-left transition ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-dim)] shadow-[0_16px_40px_rgba(0,0,0,0.28)] -translate-y-1'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-2)]/80 hover:-translate-y-1 hover:border-[var(--border-default)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-2xl">
                    {card.icon}
                  </div>
                  {active ? (
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                      当前入口
                    </div>
                  ) : null}
                </div>
                <div className="mt-5 text-lg font-semibold text-[var(--text-primary)]">{card.title}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{card.englishTitle}</div>
                <div className="mt-3 text-sm text-slate-200">{card.persona}</div>
                <div className="mt-1 text-xs text-slate-300">{card.subtitle}</div>
                <div className="mt-3 text-xs leading-6 text-slate-400">{card.description}</div>
              </button>
            )
          })}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/85 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">当前 Mock 场景</div>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
              <select
                value={mockScenario}
                onChange={(event) => setMockScenario(Number(event.target.value))}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3 text-sm text-[var(--text-primary)]"
              >
                {mockScenarios.map((scenario) => (
                  <option key={scenario.code} value={scenario.id}>
                    {scenario.code}
                  </option>
                ))}
              </select>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{currentScenario.label}</div>
                <div className="mt-1 text-xs leading-6 text-slate-400">{currentScenario.summary}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1">
                {currentScenario.connection}
              </div>
              <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1">
                电量 {currentScenario.battery}
              </div>
              <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1">
                电极质量 {currentScenario.electrodeQuality}
              </div>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/85 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">进入演示</div>
            <div className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
              {roleCards.find((item) => item.id === portal)?.title ?? '角色入口'}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              保持顶部 PortalSwitcher 常驻，演示时可无缝切换三端视角。
            </div>
            <button
              type="button"
              onClick={() => setLoggedIn(true)}
              className="mt-5 w-full rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition hover:brightness-110"
            >
              选择身份进入演示
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
