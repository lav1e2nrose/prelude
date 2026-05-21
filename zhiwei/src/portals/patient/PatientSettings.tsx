import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { useMemorialStore } from '../../store'

export const PatientSettings = () => {
  const memorial = useMemorialStore((state) => state.memorial)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 text-xs text-slate-400">主要联系人：陈先生</div>
        <div className="mt-2 text-xs text-slate-400">静默模式：{memorial.enabled ? '已开启' : '未开启'}</div>
        <div className="mt-2 text-xs text-slate-400">
          数据复用偏好：
          {memorial.allowFutureReuse === null ? ' 未设置' : memorial.allowFutureReuse ? ' 允许匿名复用' : ' 禁止匿名复用'}
        </div>
      </div>
      <MemorialModeBanner />
    </div>
  )
}
