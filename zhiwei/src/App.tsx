import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { PatientSupportRail } from './components/layout/PatientSupportRail'
import { Sidebar, type SidebarItem } from './components/layout/Sidebar'
import { DesktopOnlyScreen } from './pages/DesktopOnlyScreen'
import { LoginScreen } from './pages/LoginScreen'
import { DoctorAlgorithm } from './portals/doctor/DoctorAlgorithm'
import { DoctorMonitoring } from './portals/doctor/DoctorMonitoring'
import { DoctorSettings } from './portals/doctor/DoctorSettings'
import { ModelVersionManagement } from './portals/doctor/ModelVersionManagement'
import { PatientList } from './portals/doctor/PatientList'
import { ReportGenerator } from './portals/doctor/ReportGenerator'
import { AlertHistory } from './portals/guardian/AlertHistory'
import { AtAGlance } from './portals/guardian/AtAGlance'
import { CoordinationView } from './portals/guardian/CoordinationView'
import { EmergencyResponse } from './portals/guardian/EmergencyResponse'
import { GuardianSettings } from './portals/guardian/GuardianSettings'
import { TeamManagement } from './portals/guardian/TeamManagement'
import { HealthClass } from './portals/patient/HealthClass'
import { HomeStatus } from './portals/patient/HomeStatus'
import { LiveMonitor } from './portals/patient/LiveMonitor'
import { PatientSettings } from './portals/patient/PatientSettings'
import { PrenatalCalendar } from './portals/patient/PrenatalCalendar'
import { type PortalType, useAppStore, useMemorialStore, useMemorialWorkflowStore, useRealtimeStore, useSettingsStore } from './store'
import { applyDemoMode } from './store/demo'
import { toast } from './store/toast'

const RETENTION_CHECK_INTERVAL_MS = 30 * 1000

const portalNav: Record<PortalType, SidebarItem[]> = {
  patient: [
    { id: 'HomeStatus', label: '首页状态', description: '当前风险与提醒' },
    { id: 'LiveMonitor', label: '实时监测', description: '监测 · 宫缩 · 胎动' },
    { id: 'PrenatalCalendar', label: '产检日历' },
    { id: 'HealthClass', label: '健康课堂' },
    { id: 'PatientSettings', label: '设置' }
  ],
  guardian: [
    { id: 'AtAGlance', label: '概览' },
    { id: 'CoordinationView', label: '协作主页' },
    { id: 'TeamManagement', label: '团队管理' },
    { id: 'AlertHistory', label: '警报历史' },
    { id: 'EmergencyResponse', label: '紧急响应' },
    { id: 'GuardianSettings', label: '设置' }
  ],
  doctor: [
    { id: 'PatientList', label: '患者列表' },
    { id: 'DoctorMonitoring', label: '宫缩与波形', description: '热图 · EHG 波形' },
    { id: 'ReportGenerator', label: '报告生成' },
    { id: 'DoctorAlgorithm', label: '算法与审核', description: '人工审核 · 反馈队列' },
    { id: 'ModelVersionManagement', label: '模型版本' },
    { id: 'DoctorSettings', label: '设置' }
  ]
}

const portalPages: Record<PortalType, Record<string, ReactNode>> = {
  patient: {
    HomeStatus: <HomeStatus />,
    LiveMonitor: <LiveMonitor />,
    PrenatalCalendar: <PrenatalCalendar />,
    HealthClass: <HealthClass />,
    PatientSettings: <PatientSettings />
  },
  guardian: {
    AtAGlance: <AtAGlance />,
    CoordinationView: <CoordinationView />,
    TeamManagement: <TeamManagement />,
    AlertHistory: <AlertHistory />,
    EmergencyResponse: <EmergencyResponse />,
    GuardianSettings: <GuardianSettings />
  },
  doctor: {
    PatientList: <PatientList />,
    DoctorMonitoring: <DoctorMonitoring />,
    ReportGenerator: <ReportGenerator />,
    DoctorAlgorithm: <DoctorAlgorithm />,
    ModelVersionManagement: <ModelVersionManagement />,
    DoctorSettings: <DoctorSettings />
  }
}

export const App = () => {
  const portal = useAppStore((state) => state.portal)
  const page = useAppStore((state) => state.page)
  const setPage = useAppStore((state) => state.setPage)
  const loggedIn = useAppStore((state) => state.loggedIn)
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)
  const processRetentionDeadline = useMemorialWorkflowStore((state) => state.processRetentionDeadline)
  const [runtimeReady, setRuntimeReady] = useState(() => Boolean(window.zhiwei?.desktop?.isDesktop))
  const isDesktop = Boolean(window.zhiwei?.desktop?.isDesktop)

  useEffect(() => {
    if (window.zhiwei?.desktop?.isDesktop) {
      return
    }

    const intervalId = window.setInterval(() => {
      if (window.zhiwei?.desktop?.isDesktop) {
        window.clearTimeout(timeoutId)
        window.clearInterval(intervalId)
        setRuntimeReady(true)
      }
    }, 32)
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId)
      setRuntimeReady(true)
    }, 320)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    processRetentionDeadline()
    const timer = window.setInterval(() => {
      processRetentionDeadline()
    }, RETENTION_CHECK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [processRetentionDeadline])

  // 退出登录时断开设备与算法订阅，清理敏感实时数据（PART 12 交互正确性）
  useEffect(() => {
    if (!loggedIn) {
      void useRealtimeStore.getState().disconnect()
      return
    }
    const session = useAppStore.getState().session
    if (session) {
      const roleLabel = session.role === 'patient' ? '孕妇端' : session.role === 'guardian' ? '家属端' : '医生端'
      toast.info(`欢迎回来，${session.displayName}`, `已以${roleLabel}身份登录`)
    }
    // 演示模式：登录后自动接入 mock 数据源+算法并载入三端演示数据（波形/日志/警报立即可见）
    if (useSettingsStore.getState().demoMode) {
      applyDemoMode(true)
    }
  }, [loggedIn])

  useEffect(() => {
    if (!runtimeReady || !isDesktop) {
      document.documentElement.setAttribute('data-theme', 'pro')
      document.documentElement.setAttribute('data-memorial', 'false')
      return
    }
    const theme = portal === 'patient' ? 'warm' : 'pro'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-memorial', memorialEnabled ? 'true' : 'false')
  }, [isDesktop, memorialEnabled, portal, runtimeReady])

  if (!runtimeReady) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
        <div className="pointer-events-none absolute -left-20 top-8 h-80 w-80 rounded-full bg-[var(--accent)]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--alert)]/15 blur-[140px]" />
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 px-8 py-7 shadow-[var(--shadow-card)] backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop</div>
          <div className="mt-3 text-lg font-semibold">正在连接桌面运行时…</div>
          <div className="mt-2 text-sm text-slate-300">初始化窗口控制、设备桥接与演示环境。</div>
        </div>
      </div>
    )
  }

  if (!isDesktop) {
    return <DesktopOnlyScreen />
  }

  if (!loggedIn) {
    return <LoginScreen />
  }

  const items = portalNav[portal] ?? []
  const activePage = portalPages[portal]?.[page] ?? portalPages[portal]?.[items[0]?.id ?? '']

  return (
    <AppShell
      pageKey={`${portal}:${page}`}
      sidebar={<Sidebar items={items} activeId={page} onSelect={setPage} />}
      rightRail={portal === 'patient' && !memorialEnabled ? <PatientSupportRail /> : undefined}
    >
      {activePage}
    </AppShell>
  )
}
