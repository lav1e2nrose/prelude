import { StatsCharts } from '../../components/charts/StatsCharts'

export const ReportGenerator = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">报告生成器</div>
        <p className="mt-2 text-xs text-slate-400">支持一键生成 7 天摘要 PDF。</p>
      </div>
      <StatsCharts />
    </div>
  )
}
