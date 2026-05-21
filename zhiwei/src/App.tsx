import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { Sidebar, type SidebarItem } from './components/layout/Sidebar'
import { DesktopOnlyScreen } from './pages/DesktopOnlyScreen'
import { LoginScreen } from './pages/LoginScreen'
import { AlgorithmFeedback } from './portals/doctor/AlgorithmFeedback'
import { ContractionHeatmapPage } from './portals/doctor/ContractionHeatmapPage'
import { DoctorSettings } from './portals/doctor/DoctorSettings'
import { ModelVersionManagement } from './portals/doctor/ModelVersionManagement'
import { OverridePanel } from './portals/doctor/OverridePanel'
import { PatientList } from './portals/doctor/PatientList'
import { ReportGenerator } from './portals/doctor/ReportGenerator'
import { WaveformReview } from './portals/doctor/WaveformReview'
import { AlertHistory } from './portals/guardian/AlertHistory'
import { AtAGlance } from './portals/guardian/AtAGlance'
import { CoordinationView } from './portals/guardian/CoordinationView'
import { EmergencyResponse } from './portals/guardian/EmergencyResponse'
import { GuardianSettings } from './portals/guardian/GuardianSettings'
import { TeamManagement } from './portals/guardian/TeamManagement'
import { ContractionLog } from './portals/patient/ContractionLog'
import { FetalMovementCounter } from './portals/patient/FetalMovementCounter'
import { HealthClass } from './portals/patient/HealthClass'
import { HomeStatus } from './portals/patient/HomeStatus'
import { LiveMonitor } from './portals/patient/LiveMonitor'
import { PatientSettings } from './portals/patient/PatientSettings'
import { PrenatalCalendar } from './portals/patient/PrenatalCalendar'
import { type PortalType, useAppStore } from './store'

const portalNav: Record<PortalType, SidebarItem[]> = {
  patient: [
    { id: 'HomeStatus', label: '首页状态', description: '当前风险与提醒' },
    { id: 'LiveMonitor', label: '实时监测' },
    { id: 'ContractionLog', label: '宫缩记录' },
    { id: 'FetalMovementCounter', label: '胎动计数' },
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
    { id: 'ContractionHeatmapPage', label: '宫缩热图' },
    { id: 'WaveformReview', label: '波形复核' },
    { id: 'ReportGenerator', label: '报告生成' },
    { id: 'AlgorithmFeedback', label: '算法反馈' },
    { id: 'ModelVersionManagement', label: '模型版本' },
    { id: 'OverridePanel', label: '医生覆盖' },
    { id: 'DoctorSettings', label: '设置' }
  ]
}

const portalPages: Record<PortalType, Record<string, ReactNode>> = {
  patient: {
    HomeStatus: <HomeStatus />,
    LiveMonitor: <LiveMonitor />,
    ContractionLog: <ContractionLog />,
    FetalMovementCounter: <FetalMovementCounter />,
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
    ContractionHeatmapPage: <ContractionHeatmapPage />,
    WaveformReview: <WaveformReview />,
    ReportGenerator: <ReportGenerator />,
    AlgorithmFeedback: <AlgorithmFeedback />,
    ModelVersionManagement: <ModelVersionManagement />,
    OverridePanel: <OverridePanel />,
    DoctorSettings: <DoctorSettings />
  }
}

export const App = () => {
  const portal = useAppStore((state) => state.portal)
  const page = useAppStore((state) => state.page)
  const setPage = useAppStore((state) => state.setPage)
  const loggedIn = useAppStore((state) => state.loggedIn)
  const isDesktop = Boolean(window.zhiwei?.desktop?.isDesktop)

  useEffect(() => {
    if (!isDesktop) {
      document.documentElement.setAttribute('data-theme', 'pro')
      return
    }
    const theme = portal === 'patient' ? 'warm' : 'pro'
    document.documentElement.setAttribute('data-theme', theme)
  }, [isDesktop, portal])

  if (!isDesktop) {
    return <DesktopOnlyScreen />
  }

  if (!loggedIn) {
    return <LoginScreen />
  }

  const items = portalNav[portal] ?? []
  const activePage = portalPages[portal]?.[page] ?? portalPages[portal]?.[items[0]?.id ?? '']

  return (
    <AppShell sidebar={<Sidebar items={items} activeId={page} onSelect={setPage} />}>
      {activePage}
    </AppShell>
  )
}
