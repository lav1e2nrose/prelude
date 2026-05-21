import type { ReactNode } from 'react'
import { TitleBar } from './TitleBar'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

export const AppShell = ({ sidebar, children }: AppShellProps) => {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-0)] px-4 py-5 text-white">
      <div className="flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[var(--bg-0)] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          <main className="flex-1 overflow-y-auto bg-[var(--bg-0)] p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
