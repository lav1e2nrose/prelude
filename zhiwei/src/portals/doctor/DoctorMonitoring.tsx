import { useState } from 'react'
import { ContractionHeatmapPage } from './ContractionHeatmapPage'
import { WaveformReview } from './WaveformReview'

// 宫缩热图与 EHG 波形整合为一个监测分析页，通过分段切换；两者共享「当前患者」上下文。
export const DoctorMonitoring = () => {
  const [tab, setTab] = useState<'heatmap' | 'waveform'>('heatmap')

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-1 text-sm">
        {([
          ['heatmap', '宫缩热图'],
          ['waveform', 'EHG 波形']
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
      {tab === 'heatmap' ? <ContractionHeatmapPage /> : <WaveformReview />}
    </div>
  )
}
