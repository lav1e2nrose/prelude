import { useState } from 'react'

type FeedbackTab = 'user' | 'override'
type ProcessStatus = '待处理' | '已通过' | '已退回'

interface FeedbackItem {
  id: string
  patient: string
  timeLabel: string
  algorithmJudgment: string
  feedbackType: string
  status: ProcessStatus
  source: 'user' | 'override'
  note?: string
}

const initialItems: FeedbackItem[] = [
  { id: 'fb-001', patient: '张小雅', timeLabel: '11-12 14:23', algorithmJudgment: '有效宫缩', feedbackType: '假阳性', status: '待处理', source: 'user', note: '用户主诉无感觉，当时在步行' },
  { id: 'fb-002', patient: '张小雅', timeLabel: '11-12 18:11', algorithmJudgment: 'alert 预警', feedbackType: '假阳性', status: '待处理', source: 'user' },
  { id: 'fb-003', patient: '李女士', timeLabel: '11-13 03:11', algorithmJudgment: 'emergency', feedbackType: '医生覆盖', status: '待处理', source: 'override', note: '患者双胎减胎术后，算法对此未充分验证' },
  { id: 'fb-004', patient: '王女士', timeLabel: '11-13 09:05', algorithmJudgment: '有效宫缩', feedbackType: '确认', status: '已通过', source: 'user' },
  { id: 'fb-005', patient: '周女士', timeLabel: '11-13 22:41', algorithmJudgment: 'alert 预警', feedbackType: '假阳性', status: '已退回', source: 'user', note: '体位变化引发，已调整检测窗口' },
  { id: 'fb-006', patient: '赵女士', timeLabel: '11-14 02:15', algorithmJudgment: 'attention', feedbackType: '医生覆盖', status: '待处理', source: 'override', note: '算法忽略了宫颈环扎术病史' },
  { id: 'fb-007', patient: '钱女士', timeLabel: '11-14 08:33', algorithmJudgment: '有效宫缩', feedbackType: '确认', status: '已通过', source: 'user' },
  { id: 'fb-008', patient: '李女士', timeLabel: '11-14 11:52', algorithmJudgment: 'alert 预警', feedbackType: '假阳性', status: '待处理', source: 'user', note: '患者进行了阴道检查，活动伪迹' }
]

const statusColors: Record<ProcessStatus, string> = {
  '待处理': 'text-amber-300 bg-amber-500/10 border-amber-400/20',
  '已通过': 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
  '已退回': 'text-slate-400 bg-[var(--bg-2)] border-[var(--border-subtle)]'
}

export const AlgorithmFeedback = () => {
  const [activeTab, setActiveTab] = useState<FeedbackTab>('user')
  const [items, setItems] = useState<FeedbackItem[]>(initialItems)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = items.filter((item) => activeTab === 'user' ? item.source === 'user' : item.source === 'override')
  const userItems = items.filter((i) => i.source === 'user')
  const overrideItems = items.filter((i) => i.source === 'override')
  const pendingCount = items.filter((i) => i.status === '待处理').length
  const passedCount = items.filter((i) => i.status === '已通过').length

  const updateStatus = (id: string, status: ProcessStatus) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item))
    setSelected((prev) => prev.filter((s) => s !== id))
  }

  const batchPass = () => {
    setItems((prev) =>
      prev.map((item) => selected.includes(item.id) ? { ...item, status: '已通过' as ProcessStatus } : item)
    )
    setSelected([])
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  return (
    <div className="space-y-4">
      {/* 统计栏 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '用户反馈', value: userItems.length, sub: `待处理 ${userItems.filter((i) => i.status === '待处理').length}` },
          { label: '医生覆盖', value: overrideItems.length, sub: `待处理 ${overrideItems.filter((i) => i.status === '待处理').length}` },
          { label: '本周通过', value: passedCount, sub: '→ 已发送至算法团队' },
          { label: '待处理', value: pendingCount, sub: '需审核' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
            <div className="text-xs text-slate-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* 主表格 */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-1)]">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 pt-4">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`rounded-t-[var(--radius-control)] px-4 py-2 text-xs transition ${
                activeTab === 'user'
                  ? 'border border-b-0 border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--text-primary)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              用户反馈（{userItems.length}）
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('override')}
              className={`rounded-t-[var(--radius-control)] px-4 py-2 text-xs transition ${
                activeTab === 'override'
                  ? 'border border-b-0 border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--text-primary)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              医生覆盖（{overrideItems.length}）
            </button>
          </div>
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={batchPass}
              className="mb-1 rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1.5 text-xs text-white"
            >
              批量通过（{selected.length}）
            </button>
          ) : null}
        </div>

        <div className="p-4">
          {/* 表头 */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-3 pb-2 text-[11px] uppercase tracking-wider text-slate-500">
            <span />
            <span>患者</span>
            <span>时间</span>
            <span>算法判断</span>
            <span>反馈类型</span>
            <span>处理</span>
          </div>

          <div className="space-y-1.5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  item.status === '待处理'
                    ? 'border-[var(--border-subtle)] bg-[var(--bg-2)]/60'
                    : 'border-transparent bg-[var(--bg-2)]/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  disabled={item.status !== '待处理'}
                  className="h-3.5 w-3.5"
                />
                <div>
                  <div className="text-sm text-slate-200">{item.patient}</div>
                  {item.note ? <div className="mt-0.5 text-[11px] text-slate-500">{item.note}</div> : null}
                </div>
                <span className="whitespace-nowrap text-xs text-slate-400">{item.timeLabel}</span>
                <span className="whitespace-nowrap rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-slate-300">
                  {item.algorithmJudgment}
                </span>
                <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] ${item.feedbackType === '假阳性' ? 'border-amber-400/20 bg-amber-500/10 text-amber-300' : item.feedbackType === '医生覆盖' ? 'border-sky-400/20 bg-sky-500/10 text-sky-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'}`}>
                  {item.feedbackType}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                  {item.status === '待处理' ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, '已通过')}
                        className="rounded border border-emerald-400/25 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-200"
                      >
                        通过
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, '已退回')}
                        className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] text-slate-400"
                      >
                        退回
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] py-8 text-center text-sm text-slate-500">
              当前分类暂无反馈记录
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
