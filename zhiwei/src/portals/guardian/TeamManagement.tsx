import { useState } from 'react'
import { useCollaborationStore } from '../../store/collaboration'

export const TeamManagement = () => {
  const guardians = useCollaborationStore((state) => state.guardians)
  const schedule = useCollaborationStore((state) => state.schedule)
  const [primaryId, setPrimaryId] = useState(
    guardians.find((guardian) => guardian.isPrimaryContact)?.id ?? guardians[0]?.id ?? ''
  )

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">团队管理</div>
      <div className="mt-4 space-y-3">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/60 p-3">
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
                    : 'border-[var(--border-subtle)] text-slate-300'
                }`}
              >
                {primaryId === guardian.id ? '当前第一联系人' : '设为第一联系人'}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">值守排班</div>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          {schedule.shifts.map((shift) => (
            <div key={`${shift.guardianId}-${shift.startTime}`} className="flex items-center justify-between">
              <span>{guardians.find((guardian) => guardian.id === shift.guardianId)?.name}</span>
              <span>
                {shift.startTime}-{shift.endTime} · {shift.daysOfWeek.length} 天/周
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
