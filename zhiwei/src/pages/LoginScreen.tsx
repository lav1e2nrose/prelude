import { useAppStore } from '../store'

export const LoginScreen = () => {
  const setLoggedIn = useAppStore((state) => state.setLoggedIn)

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-0)] text-white">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-1)] p-8">
        <div className="text-sm uppercase tracking-[0.3em] text-slate-400">知微</div>
        <div className="mt-2 text-xl font-semibold">早产风险监测系统</div>
        <button
          type="button"
          onClick={() => setLoggedIn(true)}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-2 text-sm"
        >
          进入演示
        </button>
      </div>
    </div>
  )
}
