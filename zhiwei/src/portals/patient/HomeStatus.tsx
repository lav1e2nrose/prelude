import { StatusOrb } from '../../components/shared/StatusOrb'
import { MemorialModeBanner } from '../../components/shared/MemorialModeBanner'
import { MockModeBanner } from '../../components/shared/MockModeBanner'

export const HomeStatus = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">患者概览</div>
          <div className="text-xl font-semibold text-white">小雅 · 孕 32 周 3 天</div>
        </div>
        <StatusOrb level="attention" label="轻度预警" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MockModeBanner />
        <MemorialModeBanner />
      </div>
    </div>
  )
}
