import type { ReactNode } from 'react'
import { TitleBar } from './TitleBar'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
  rightRail?: ReactNode
}

export const AppShell = ({ sidebar, children, rightRail }: AppShellProps) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-36 top-16 h-96 w-96 rounded-full bg-[var(--accent)]/12 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[var(--alert)]/10 blur-[140px]" />
      <div className="relative flex h-full w-full flex-col overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-0)] shadow-[var(--shadow-card)]">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          <main className="flex-1 overflow-y-auto bg-[var(--bg-0)]/95 p-6">{children}</main>
          {rightRail}
        </div>
      </div>
    </div>
  )
}
