import { useAppStore } from '../store'

const roleCards = [
  {
    id: 'patient',
    title: '孕妇端',
    subtitle: '个人风险与监测视图',
    description: '查看实时波形、宫缩趋势与日常健康任务。'
  },
  {
    id: 'guardian',
    title: '家属端',
    subtitle: '协作响应与分工看板',
    description: '统一查看状态变化，减少重复响应和信息断层。'
  },
  {
    id: 'doctor',
    title: '医生端',
    subtitle: '临床解释与决策覆盖',
    description: '查看患者队列、算法解释与临床覆盖入口。'
  }
] as const

export const LoginScreen = () => {
  const setLoggedIn = useAppStore((state) => state.setLoggedIn)
  const portal = useAppStore((state) => state.portal)
  const setPortal = useAppStore((state) => state.setPortal)

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[var(--alert)]/15 blur-[120px]" />
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[var(--bg-1)]/95 p-8 shadow-[0_32px_90px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop</div>
        <div className="mt-2 text-3xl font-semibold">早产风险监测系统</div>
        <p className="mt-3 text-sm text-slate-300">医疗级演示版 · 三端一体化桌面控制台</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {roleCards.map((card) => {
            const active = portal === card.id
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setPortal(card.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-dim)] shadow-[0_16px_40px_rgba(0,0,0,0.28)]'
                    : 'border-white/10 bg-[var(--bg-2)]/80 hover:border-white/20 hover:bg-[var(--bg-2)]'
                }`}
              >
                <div className="text-sm font-semibold text-white">{card.title}</div>
                <div className="mt-1 text-xs text-slate-300">{card.subtitle}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{card.description}</div>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setLoggedIn(true)}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-medium transition hover:brightness-110"
        >
          进入 {roleCards.find((item) => item.id === portal)?.title ?? '演示'}
        </button>
      </div>
    </div>
  )
}
