import { CountdownCallButton } from '../../components/shared/CountdownCallButton'

export const EmergencyResponse = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">紧急响应</div>
      <p className="mt-3 text-sm text-slate-200">3 秒倒计时确认呼叫 120 或主治医生。</p>
      <div className="mt-4">
        <CountdownCallButton label="呼叫 120" />
      </div>
    </div>
  )
}
