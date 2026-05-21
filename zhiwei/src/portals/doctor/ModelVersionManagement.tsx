const models = [
  { version: 'EHG-Net-v2.3.1', status: '已上线', updatedAt: '2026-05-18' },
  { version: 'EHG-Net-v2.4.0', status: '灰度', updatedAt: '2026-05-20' }
]

export const ModelVersionManagement = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">模型版本管理</div>
      <div className="mt-4 space-y-3">
        {models.map((model) => (
          <div key={model.version} className="flex items-center justify-between text-sm text-slate-200">
            <span>{model.version}</span>
            <span className="text-xs text-slate-400">{model.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
