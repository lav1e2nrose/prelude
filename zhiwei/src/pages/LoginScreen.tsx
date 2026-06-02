import { useState } from 'react'
import { authenticateDemo, DEMO_ACCOUNTS, DEMO_PATIENT_PROFILE } from '../data/demoAccounts'
import { useAppStore } from '../store'
import type { UserRole } from '../types/user'

const roleMeta: Record<UserRole, { label: string; icon: string; desc: string }> = {
  patient: { label: '孕妇端', icon: '👩', desc: '实时监测 · 宫缩 · 胎动 · 分级提醒' },
  guardian: { label: '家属端', icon: '👨', desc: '协作响应 · 在岗排班 · 升级机制' },
  doctor: { label: '医生端', icon: '⚕', desc: '患者队列 · 算法解释 · 覆盖流程' }
}

export const LoginScreen = () => {
  const login = useAppStore((state) => state.login)
  const [username, setUsername] = useState(() => window.localStorage.getItem('zhiwei.lastUser') ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(window.localStorage.getItem('zhiwei.lastUser')))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (user: string, pass: string) => {
    const session = authenticateDemo(user, pass)
    if (!session) {
      setError('用户名或密码错误')
      return
    }
    if (remember) window.localStorage.setItem('zhiwei.lastUser', user.trim())
    else window.localStorage.removeItem('zhiwei.lastUser')
    setError('')
    // 真实部署时档案随会话由后端下发；当前用演示档案。
    login(session, DEMO_PATIENT_PROFILE)
  }

  const handleLogin = () => {
    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }
    submit(username, password)
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[var(--alert)]/15 blur-[120px]" />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">知微 · ZhīWēi</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">智护孕程</p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-6 shadow-[var(--shadow-card)] backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">账号登录</div>
          <div className="mt-4 grid gap-3">
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:border-[var(--accent)] focus:outline-none"
              placeholder="用户名"
              autoComplete="username"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:border-[var(--accent)] focus:outline-none"
              placeholder="密码"
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={() => setRemember((p) => !p)} />
                记住用户名
              </label>
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="underline underline-offset-4">
                {showPassword ? '隐藏密码' : '显示密码'}
              </button>
            </div>
            {error ? <div className="text-xs text-rose-400">{error}</div> : null}
            <button
              type="button"
              onClick={handleLogin}
              className="mt-1 w-full rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              登录
            </button>
            <p className="text-center text-[11px] leading-5 text-slate-500">
              登录后将以您账户绑定的身份进入。身份在会话期间不可切换，换身份请退出登录。
            </p>
          </div>
        </div>

        {/* 开发期演示账户（后端就绪后移除） */}
        <div className="mt-5 rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)]/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">演示账户（开发期）· 密码 zhiwei</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const meta = roleMeta[account.session.role]
              return (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => submit(account.username, account.password)}
                  className="group rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--border-default)] active:scale-[0.97]"
                >
                  <div className="text-xl">{meta.icon}</div>
                  <div className="mt-2 text-sm font-medium text-[var(--text-primary)]">{meta.label}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{account.username}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
