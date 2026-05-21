import { useAppStore } from '../store'

export const LoginScreen = () => {
  const setLoggedIn = useAppStore((state) => state.setLoggedIn)

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[var(--alert)]/10 blur-[120px]" />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[var(--bg-1)]/95 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop</div>
        <div className="mt-2 text-2xl font-semibold">早产风险监测系统</div>
        <p className="mt-3 text-sm text-slate-300">医疗级演示版 · 孕妇端 / 家属端 / 医生端一体化控制台</p>
        <button
          type="button"
          onClick={() => setLoggedIn(true)}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-medium transition hover:brightness-110"
        >
          进入演示
        </button>
      </div>
    </div>
  )
}
