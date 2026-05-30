import { useState } from 'react'
import { mockScenarios } from '../data/mockScenarios'
import { type PortalType, useAppStore } from '../store'
import { useRealtimeStore } from '../store'

interface RoleCard {
  id: PortalType
  icon: string
  title: string
  englishTitle: string
  name: string
  subtitle: string
  description: string
}

const roleCards: RoleCard[] = [
  {
    id: 'patient',
    icon: '👩',
    title: '孕妇端',
    englishTitle: 'Mama',
    name: '张小雅',
    subtitle: '孕 32 周 + 3 天',
    description: '实时监测 · 宫缩记录 · 胎动计数 · 分级提醒'
  },
  {
    id: 'guardian',
    icon: '👨',
    title: '家属端',
    englishTitle: 'Family',
    name: '陈先生（丈夫）',
    subtitle: '第一通知人',
    description: '协作响应 · 在岗排班 · 分工看板 · 升级机制'
  },
  {
    id: 'doctor',
    icon: '⚕',
    title: '医生端',
    englishTitle: 'Doctor',
    name: '王主任',
    subtitle: '产科主治医生',
    description: '患者队列 · 算法解释 · 可解释性面板 · 覆盖流程'
  }
]

const displayNameByPortal: Record<PortalType, string> = {
  patient: '张小雅',
  guardian: '陈先生',
  doctor: '王主任'
}

export const LoginScreen = () => {
  const login = useAppStore((state) => state.login)
  const patchSourceConfig = useRealtimeStore((state) => state.patchSourceConfig)
  const setDataSourceType = useRealtimeStore((state) => state.setDataSourceType)
  const sourceConfig = useRealtimeStore((state) => state.sourceConfig)
  const [selectedScenario, setSelectedScenario] = useState(sourceConfig.mock.scenario)

  const handleEnter = (portalId: PortalType) => {
    patchSourceConfig('mock', { scenario: selectedScenario })
    setDataSourceType('mock')
    login({ username: portalId, displayName: displayNameByPortal[portalId] })
  }

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[var(--alert)]/15 blur-[120px]" />

      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">知微 · ZhīWēi</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">见微知著，守护早产高危妈妈</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roleCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleEnter(card.id)}
              className="group rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-6 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-[var(--border-default)] hover:bg-[var(--bg-1)] active:scale-[0.97]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-2xl">
                {card.icon}
              </div>
              <div className="mt-5 text-lg font-semibold text-[var(--text-primary)]">{card.title}</div>
              <div className="mt-0.5 text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{card.englishTitle}</div>
              <div className="mt-3 text-sm font-medium text-slate-200">{card.name}</div>
              <div className="mt-1 text-xs text-slate-400">{card.subtitle}</div>
              <div className="mt-3 text-xs leading-5 text-slate-500">{card.description}</div>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-[var(--accent)] opacity-0 transition group-hover:opacity-100">
                点击进入 →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="text-xs text-slate-500">当前 Mock 场景：</div>
          <select
            value={selectedScenario}
            onChange={(event) => setSelectedScenario(event.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          >
            {mockScenarios.map((scenario) => (
              <option key={scenario.code} value={scenario.code}>
                {scenario.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-center text-xs text-slate-600">选择角色身份后直接进入工作台，无需密码</p>
      </div>
    </div>
  )
}
