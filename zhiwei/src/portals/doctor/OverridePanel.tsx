export const OverridePanel = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">医生覆盖流程</div>
      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div>1. 查看风险评分 → 解释面板</div>
        <div>2. 选择不同意并填写临床理由</div>
        <div>3. 提交后进入 Algorithm Feedback 队列</div>
      </div>
      <button type="button" className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm">
        新建覆盖记录
      </button>
    </div>
  )
}
