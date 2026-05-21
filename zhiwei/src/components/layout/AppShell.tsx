import type { ReactNode } from 'react'
import { TitleBar } from './TitleBar'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

export const AppShell = ({ sidebar, children }: AppShellProps) => {
  return (
    <div className="flex h-screen flex-col bg-[var(--bg-0)] text-white">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {sidebar}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
