import type { RiskLevel } from '../types/signal'

// 医生端统一患者名册（单一数据源）。患者列表 / 热图 / 波形 / 报告均引用此处，
// 保证全端患者姓名与数据一致，杜绝"报告里的人和列表里的人对不上"。

export type DoctorPatientStatus = 'monitoring' | 'ended' | 'memorial'

export interface DoctorPatient {
  id: string
  name: string
  week: string
  riskFactors: string[]
  contractionRate: string
  /** 7 日早产风险（%）。可解释性面板以此为锚，保证摘要与该值一致 */
  risk7d: number
  level: RiskLevel
  status: DoctorPatientStatus
}

// 演示名册。其中 P-002 张小雅即孕妇端登录的受监测对象，三端同名同档。
export const DEMO_DOCTOR_PATIENTS: DoctorPatient[] = [
  { id: 'P-001', name: '赵敏', week: '27+6', riskFactors: ['双胎', '高龄'], contractionRate: '4 次/h', risk7d: 24.1, level: 'alert', status: 'monitoring' },
  { id: 'P-002', name: '张小雅', week: '32+3', riskFactors: ['高龄', '试管', '宫颈机能不全'], contractionRate: '1 次/h', risk7d: 5.8, level: 'attention', status: 'monitoring' },
  { id: 'P-003', name: '李慧', week: '29+5', riskFactors: ['双胎', '宫颈机能不全'], contractionRate: '3 次/h', risk7d: 18.3, level: 'alert', status: 'monitoring' },
  { id: 'P-004', name: '周敏', week: '30+2', riskFactors: ['宫颈机能不全'], contractionRate: '2 次/h', risk7d: 9.6, level: 'attention', status: 'monitoring' },
  { id: 'P-005', name: '吴桐', week: '33+1', riskFactors: ['早产史'], contractionRate: '0.5 次/h', risk7d: 3.1, level: 'safe', status: 'monitoring' },
  { id: 'P-006', name: '郑岚', week: '28+4', riskFactors: ['高龄', '宫颈机能不全', '试管'], contractionRate: '2.5 次/h', risk7d: 14.7, level: 'attention', status: 'monitoring' },
  { id: 'P-007', name: '王琳', week: '34+1', riskFactors: ['早产史'], contractionRate: '0 次/h', risk7d: 1.2, level: 'safe', status: 'monitoring' },
  { id: 'P-008', name: '钱蕾', week: '36+0', riskFactors: ['试管', '高龄'], contractionRate: '0.5 次/h', risk7d: 3.1, level: 'safe', status: 'monitoring' }
]

export const LEVEL_BADGE: Record<RiskLevel, { label: string; cls: string }> = {
  safe: { label: '平稳', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
  attention: { label: '留意', cls: 'text-amber-300 bg-amber-500/10 border-amber-400/20' },
  alert: { label: '警示', cls: 'text-rose-300 bg-rose-500/10 border-rose-400/20' },
  emergency: { label: '紧急', cls: 'text-red-200 bg-red-500/15 border-red-400/30' }
}
