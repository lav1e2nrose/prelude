import { useAppStore, useRealtimeStore } from '../../store'
import { getMockScenarioDefinition, mockScenarios } from '../../data/mockScenarios'

export const MockModeBanner = () => {
  const mockScenario = useAppStore((state) => state.mockScenario)
  const setMockScenario = useAppStore((state) => state.setMockScenario)
  const dataSourceType = useRealtimeStore((state) => state.dataSourceType)
  const scenario = getMockScenarioDefinition(mockScenario)

  if (dataSourceType !== 'mock') {
    return null
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Mock 演示</div>
      <div className="mt-3 flex flex-col gap-3">
        <div className="text-sm text-slate-300">
          当前剧本：{scenario.id}. {scenario.label}
        </div>
        <select
          value={mockScenario}
          onChange={(event) => setMockScenario(Number(event.target.value))}
          className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {mockScenarios.map((scenario) => (
            <option key={scenario.code} value={scenario.id}>
              {scenario.id}. {scenario.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
