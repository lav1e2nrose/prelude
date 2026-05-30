import { ContractionHeatmap } from '../../components/charts/ContractionHeatmap'
import { ShapBarChart } from '../../components/charts/ShapBarChart'

const patternInsights = [
  {
    title: '夜间宫缩倾向',
    detail: '02:00–05:00 占总宫缩的 41%',
    suggestion: '建议：评估夜间体位与床垫硬度，必要时给予短效宫缩抑制剂睡前服用。'
  },
  {
    title: '活动相关性',
    detail: '步行 > 2000 步当天，宫缩频率 +35%',
    suggestion: '建议：单日活动量上限调整至 1500 步，监测期间建议在监测时段内保持卧姿。'
  },
  {
    title: '宫缩规律性上升',
    detail: '过去 7 天规律性指数从 0.3 升至 0.6',
    suggestion: '建议：结合宫颈长度评估，规律性 > 0.7 时建议复查。'
  }
]

export const ContractionHeatmapPage = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ContractionHeatmap />
        <ShapBarChart />
      </div>

      {/* 模式分析段 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">系统识别出的模式</div>
          <button
            type="button"
            className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-300"
          >
            ⓘ 查看这些结论是如何得出的
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {patternInsights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/70 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">· {insight.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{insight.detail}</div>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-400">
                {insight.suggestion}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 热图图例说明 */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
          <div className="text-xs text-slate-400">热图色阶说明</div>
          <div className="mt-2 flex items-center gap-2">
            {['#1D2126', '#3A2A1F', '#6B4530', '#9B6440', '#D08850'].map((color, i) => (
              <div key={color} className="flex items-center gap-1 text-[11px] text-slate-400">
                <div className="h-4 w-6 rounded" style={{ backgroundColor: color }} />
                <span>{['无', '1-2', '3-4', '5-6', '7+'][i]}</span>
              </div>
            ))}
            <span className="ml-1 text-[11px] text-slate-500">次/小时</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span>右上角小三角 = 该格有 alert 级预警</span>
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
          <div className="text-xs text-slate-400">交互说明</div>
          <div className="mt-2 space-y-1 text-[11px] text-slate-500">
            <div>· hover 格子 → 查看当时宫缩详情 tooltip</div>
            <div>· click 格子 → 跳转到 EHG 波形回放该时段</div>
          </div>
        </div>
      </div>
    </div>
  )
}
