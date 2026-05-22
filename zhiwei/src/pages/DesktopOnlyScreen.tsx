export const DesktopOnlyScreen = () => {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[var(--bg-0)] px-6 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute -left-20 top-8 h-80 w-80 rounded-full bg-[var(--accent)]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--alert)]/15 blur-[140px]" />
      <div className="w-full max-w-3xl rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]/95 p-10 shadow-[var(--shadow-card)] backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.34em] text-[var(--accent)]">zhiwei desktop only</div>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">请通过桌面客户端启动“知微”</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          当前页面只用于开发预览确认。知微是 Electron PC 桌面应用，网页端不能运行完整功能，也不会开放临床演示交互。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/85 p-5 text-sm text-slate-300">
            <div className="font-medium text-slate-100">为什么这里不能直接使用</div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              <div>• 标题栏控制、窗口管理、桌面桥接与设备联机都依赖 Electron preload。</div>
              <div>• 浏览器预览页不会注入桌面 API，因此只保留启动说明，不提供业务操作。</div>
              <div>• 正式演示请始终使用弹出的独立桌面窗口，而不是浏览器标签页。</div>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)]/85 p-5 text-sm text-slate-300">
            <div className="font-medium text-slate-100">推荐启动方式</div>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div>npm run dev</div>
              <div>npm run build && npm run desktop</div>
            </div>
            <div className="mt-4 rounded-[var(--radius-control)] border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              成功时会打开一个独立 Electron 窗口，并显示顶部桌面控制栏。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
