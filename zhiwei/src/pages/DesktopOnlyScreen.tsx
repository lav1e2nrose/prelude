export const DesktopOnlyScreen = () => {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-20 top-8 h-80 w-80 rounded-full bg-[var(--accent)]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--alert)]/15 blur-[140px]" />
      <div className="w-full max-w-2xl rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-10 shadow-[var(--shadow-card)] backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop only</div>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">请通过桌面客户端启动“知微”</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          当前页面为开发预览入口。根据产品定义，知微应以独立桌面窗口运行，不提供网页端交互。
        </p>
        <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/85 p-5 text-sm text-slate-300">
          <div className="font-medium text-slate-100">推荐启动方式</div>
          <div className="mt-3 space-y-2 font-mono text-xs">
            <div>npm run dev</div>
            <div>npm run build && npm run desktop</div>
          </div>
        </div>
      </div>
    </div>
  )
}
