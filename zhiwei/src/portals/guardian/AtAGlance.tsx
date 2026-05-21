import { StatusOrb } from '../../components/shared/StatusOrb'

export const AtAGlance = () => {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-white">家属概览</div>
      <StatusOrb level="attention" label="孕妇状态：轻度预警" />
    </div>
  )
}
