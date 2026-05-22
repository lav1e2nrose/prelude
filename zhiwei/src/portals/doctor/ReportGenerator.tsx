import { useState } from 'react'
import { StatsCharts } from '../../components/charts/StatsCharts'

export const ReportGenerator = () => {
  const [patientId, setPatientId] = useState('P-002')
  const [range, setRange] = useState('7 天')
  const [reports, setReports] = useState<string[]>(['2026-05-18 生成 · 7 天摘要'])

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">报告生成器</div>
        <p className="mt-2 text-xs text-slate-400">支持一键生成 7 天摘要 PDF，并附带临床解释与警报记录。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-slate-400">
            患者
            <select
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="P-001">P-001 · 林婉</option>
              <option value="P-002">P-002 · 小雅</option>
              <option value="P-003">P-003 · 张宁</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            时间范围
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option>24 小时</option>
              <option>7 天</option>
              <option>14 天</option>
            </select>
          </label>
          <div className="text-xs text-slate-400">
            报告章节
            <div className="mt-2 space-y-2 text-xs text-slate-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                风险趋势
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                预警历史
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                可解释性摘要
              </label>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setReports((prev) => [
              `${new Date().toLocaleString('zh-CN')} 生成 · ${range}摘要 · ${patientId}`,
              ...prev
            ])
          }
          className="mt-4 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-xs text-white"
        >
          生成 PDF 报告
        </button>
      </div>
      <StatsCharts />
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">最近生成</div>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          {reports.map((report) => (
            <div key={report} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">
              {report}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
