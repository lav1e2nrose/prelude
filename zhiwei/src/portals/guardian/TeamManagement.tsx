import { useState } from 'react'
import { useCollaborationStore } from '../../store/collaboration'

export const TeamManagement = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const [primaryId, setPrimaryId] = useState(
    guardians.find((guardian) => guardian.isPrimaryContact)?.id ?? guardians[0]?.id ?? ''
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">团队管理</div>
      <div className="mt-4 space-y-3">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="rounded-xl border border-white/10 bg-[var(--bg-2)]/60 p-3">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>{guardian.name}</span>
              <span className="text-xs text-slate-400">{guardian.relationship}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{guardian.currentStatus.isOnline ? '在线' : '离线'}</span>
              <button
                type="button"
                onClick={() => setPrimaryId(guardian.id)}
                className={`rounded-md border px-2 py-1 ${
                  primaryId === guardian.id
                    ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)] text-white'
                    : 'border-white/10 text-slate-300'
                }`}
              >
                {primaryId === guardian.id ? '当前第一联系人' : '设为第一联系人'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
