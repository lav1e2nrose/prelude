import { useState } from 'react'
import { CountdownCallButton } from '../../components/shared/CountdownCallButton'
import { EmergencyOverlay } from '../../components/shared/EmergencyOverlay'

export const EmergencyResponse = () => {
  const [overlayText, setOverlayText] = useState('')

  return (
    <>
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-5">
        <div className="text-sm text-slate-300">紧急响应</div>
        <p className="mt-3 text-sm text-slate-200">遵循 3 秒倒计时取消范式，避免误触发并保留紧急操作速度。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <CountdownCallButton label="呼叫 120" onConfirm={() => setOverlayText('已向 120 发起模拟呼叫。')} />
          <CountdownCallButton
            label="呼叫主治医生"
            onConfirm={() => setOverlayText('已向值班产科医生发起模拟呼叫。')}
          />
        </div>
      </div>
      <EmergencyOverlay
        visible={Boolean(overlayText)}
        title="紧急流程已触发"
        description={overlayText}
        onDismiss={() => setOverlayText('')}
      />
    </>
  )
}
