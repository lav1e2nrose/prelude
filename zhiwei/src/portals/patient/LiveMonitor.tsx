import { BreathingCircle } from '../../components/charts/BreathingCircle'
import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { EHGWaveformChart } from '../../components/charts/EHGWaveformChart'
import { StatusOrb } from '../../components/shared/StatusOrb'

export const LiveMonitor = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <EHGWaveformChart />
        <ContractionHeatmap />
      </div>
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">实时摘要</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusOrb level="attention" label="轻度预警" />
            <div className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-1 text-xs text-slate-300">
              数据延迟 0.6s
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { label: '母体心率', value: '88 bpm', hint: '轻微升高' },
              { label: '胎心率', value: '144 bpm', hint: '正常范围' },
              { label: '体位', value: '左侧卧', hint: '信号稳定' },
              { label: '电极质量', value: '92%', hint: '稳定连接' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm text-slate-300">
                <span>{item.label}</span>
                <span className="text-slate-200">{item.value}</span>
                <span className="text-xs text-slate-400">{item.hint}</span>
              </div>
            ))}
          </div>
        </div>
        <BreathingCircle />
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4 text-xs text-slate-300">
          监测提示：若宫缩间隔持续缩短，可点击“宫缩记录”页面进行手动标记，便于医生复核。
        </div>
      </div>
    </div>
  )
}
