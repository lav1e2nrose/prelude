export const BreathingCircle = () => {
  return (
    <section className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">呼吸节律</div>
      <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-full border border-[var(--border-default)]">
        <div className="h-16 w-16 rounded-full bg-[var(--accent)]/20 animate-[breathing_6s_ease-in-out_infinite]" />
      </div>
      <div className="mt-3 text-xs text-slate-400">呼吸节奏：4 秒吸气 · 6 秒呼气</div>
    </section>
  )
}
