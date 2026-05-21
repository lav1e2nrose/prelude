import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'

export const PatientSettings = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[var(--bg-1)] p-4">
        <div className="text-sm text-slate-300">账号设置</div>
        <div className="mt-3 text-xs text-slate-400">主要联系人：陈先生</div>
      </div>
      <MemorialModeBanner />
    </div>
  )
}
