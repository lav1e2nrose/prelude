import { useAppStore } from '../../store'

const scenarios = [
  '1. 正常稳定监测',
  '2. 宫缩频率上升',
  '3. 设备电极松动',
  '4. 胎动减少',
  '5. 夜间紧急预警',
  '6. 家属协作升级',
  '7. 家属协作流',
  '8. 医生覆盖流程'
]

export const MockModeBanner = () => {
  const mockScenario = useAppStore((state) => state.mockScenario)
  const setMockScenario = useAppStore((state) => state.setMockScenario)

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Mock 演示</div>
      <div className="mt-3 flex flex-col gap-3">
        <div className="text-sm text-slate-300">当前剧本：{scenarios[mockScenario - 1]}</div>
        <select
          value={mockScenario}
          onChange={(event) => setMockScenario(Number(event.target.value))}
          className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {scenarios.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
