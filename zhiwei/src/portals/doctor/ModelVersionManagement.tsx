import { useState } from 'react'

const models = [
  { version: 'EHG-Net-v2.3.1', status: '已上线', updatedAt: '2026-05-18', auc: 0.91 },
  { version: 'EHG-Net-v2.4.0', status: '灰度', updatedAt: '2026-05-20', auc: 0.93 }
]

export const ModelVersionManagement = () => {
  const [activeVersion, setActiveVersion] = useState('EHG-Net-v2.3.1')

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">模型版本管理</div>
      <div className="mt-4 space-y-3">
        {models.map((model) => (
          <div
            key={model.version}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
              activeVersion === model.version
                ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)] text-white'
                : 'border-[var(--border-subtle)] bg-[var(--bg-2)]/60 text-slate-200'
            }`}
          >
            <div>
              <div>{model.version}</div>
              <div className="mt-1 text-[11px] text-slate-400">更新时间：{model.updatedAt}</div>
              <div className="mt-1 text-[11px] text-slate-400">AUC：{model.auc.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{model.status}</span>
              <button
                type="button"
                onClick={() => setActiveVersion(model.version)}
                className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-xs text-slate-200"
              >
                设为主版本
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-300">
        当前主版本：{activeVersion}
      </div>
    </div>
  )
}
