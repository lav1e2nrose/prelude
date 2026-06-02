import { useState } from 'react'
import { AlgorithmFeedback } from './AlgorithmFeedback'
import { OverridePanel } from './OverridePanel'

// 人工审核与算法反馈整合为一个页面：审核单个患者评分 → 反馈进入队列，闭环在同一处完成。
export const DoctorAlgorithm = () => {
  const [tab, setTab] = useState<'review' | 'feedback'>('review')

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-1 text-sm">
        {([
          ['review', '人工审核'],
          ['feedback', '算法反馈队列']
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-[var(--radius-control)] px-4 py-1.5 transition ${
              tab === key ? 'bg-[var(--accent)] text-white' : 'text-slate-400 hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'review' ? <OverridePanel /> : <AlgorithmFeedback />}
    </div>
  )
}
