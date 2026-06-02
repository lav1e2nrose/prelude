import { useMemo, useState } from 'react'
import { StatsCharts } from '../../components/charts/StatsCharts'
import { useDoctorStore } from '../../store/doctor'
import { toast } from '../../store/toast'
import { PatientContextHeader } from './PatientContextHeader'

const SECTIONS = [
  { key: 'trend', label: '风险趋势' },
  { key: 'alerts', label: '预警历史' },
  { key: 'explain', label: '可解释性摘要' },
  { key: 'override', label: '算法决策摘要（含人工审核记录）' }
]

export const ReportGenerator = () => {
  const patients = useDoctorStore((s) => s.patients)
  const selectedPatientId = useDoctorStore((s) => s.selectedPatientId)
  const setSelectedPatient = useDoctorStore((s) => s.setSelectedPatient)
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null

  const [range, setRange] = useState('7 天')
  const [sections, setSections] = useState<string[]>(['trend', 'alerts', 'explain'])
  const [note, setNote] = useState('')
  const [reports, setReports] = useState<string[]>([])

  const toggleSection = (key: string) =>
    setSections((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]))

  const preview = useMemo(() => {
    if (!patient) return null
    return { name: patient.name, id: patient.id, week: patient.week, risk7d: patient.risk7d }
  }, [patient])

  if (!patient || !preview) {
    return <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-1)] p-8 text-center text-sm text-slate-400">暂无患者，无法生成报告。</div>
  }

  return (
    <div className="space-y-4">
      <PatientContextHeader />
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        {/* 左：配置 */}
        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
            <div className="text-sm text-slate-300">报告配置</div>
            <div className="mt-3 space-y-3">
              <label className="block text-xs text-slate-400">
                患者
                <select value={patient.id} onChange={(e) => setSelectedPatient(e.target.value)} className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}（{p.id}）</option>))}
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                时间范围
                <select value={range} onChange={(e) => setRange(e.target.value)} className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  <option>24 小时</option><option>7 天</option><option>14 天</option>
                </select>
              </label>
              <div className="text-xs text-slate-400">
                报告章节
                <div className="mt-2 space-y-2 text-sm text-slate-300">
                  {SECTIONS.map((s) => (
                    <label key={s.key} className="flex items-center gap-2">
                      <input type="checkbox" checked={sections.includes(s.key)} onChange={() => toggleSection(s.key)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="block text-xs text-slate-400">
                医生备注
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="补充临床意见…" className="mt-1 h-20 w-full resize-none rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[var(--accent)]" />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setReports((prev) => [`${new Date().toLocaleString('zh-CN')} · ${patient.name}（${patient.id}）· ${range}摘要`, ...prev])
                toast.success('报告已生成', `${patient.name} 的${range}报告已导出 PDF`)
              }}
              className="mt-4 w-full rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2 text-sm text-white transition hover:brightness-110"
            >
              生成 PDF 报告
            </button>
          </div>

          {reports.length > 0 ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
              <div className="text-sm text-slate-300">最近生成</div>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                {reports.map((r) => (<div key={r} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2">{r}</div>))}
              </div>
            </div>
          ) : null}
        </div>

        {/* 右：A4 实时预览 */}
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] p-4">
          <div className="text-xs text-slate-400">报告预览（A4）</div>
          <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] p-5" style={{ aspectRatio: '1 / 1.414' }}>
            <div className="text-lg font-semibold text-[var(--text-primary)]">知微 · 早产风险监测报告</div>
            <div className="mt-1 text-xs text-slate-400">{preview.name}（{preview.id}） · 孕 {preview.week} · 周期 {range}</div>
            <div className="mt-1 text-xs text-slate-500">出具医生：王主任 · {new Date().toLocaleDateString('zh-CN')}</div>
            <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm text-slate-300">
              7 日早产风险：<span className="font-semibold text-[var(--text-primary)]">{preview.risk7d}%</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
              {sections.includes('trend') ? <li>· 风险趋势：见下方趋势图</li> : null}
              {sections.includes('alerts') ? <li>· 预警历史：周期内预警记录与响应</li> : null}
              {sections.includes('explain') ? <li>· 可解释性摘要：SHAP 特征贡献与类比病例</li> : null}
              {sections.includes('override') ? <li>· 算法决策摘要：含人工审核与覆盖记录</li> : null}
            </ul>
            {note.trim() ? <div className="mt-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 text-xs text-slate-300">医生备注：{note}</div> : null}
            <div className="mt-4"><StatsCharts /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
