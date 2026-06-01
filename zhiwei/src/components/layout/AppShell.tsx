import type { ReactNode } from 'react'
import { useMemorialStore } from '../../store'
import { ConfirmHost } from '../shared/ConfirmHost'
import { DevModeBanner } from '../shared/DevModeBanner'
import { ToastHost } from '../shared/ToastHost'
import { TitleBar } from './TitleBar'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
  rightRail?: ReactNode
  /** 当前页面标识；变化时主内容区做淡入上滑转场 */
  pageKey?: string
}

export const AppShell = ({ sidebar, children, rightRail, pageKey }: AppShellProps) => {
  const memorialEnabled = useMemorialStore((state) => state.memorial.enabled)

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] text-[var(--text-primary)]">
      {!memorialEnabled ? (
        <>
          <div className="pointer-events-none absolute -left-36 top-16 h-96 w-96 rounded-full bg-[var(--accent)]/12 blur-[130px]" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[var(--alert)]/10 blur-[140px]" />
        </>
      ) : null}
      <div className="relative flex h-full w-full flex-col overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-0)] shadow-[var(--shadow-card)]">
        <TitleBar />
        <DevModeBanner />
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          <main key={pageKey} className="page-enter flex-1 overflow-y-auto bg-[var(--bg-0)]/95 p-6">
            {children}
          </main>
          {rightRail}
        </div>
      </div>
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
