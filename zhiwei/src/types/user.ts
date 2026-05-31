// 用户、身份与档案契约
// 真实部署时这些数据来自后端鉴权与档案服务；本端只消费契约，不在组件内硬编码业务数据。

export type UserRole = 'patient' | 'guardian' | 'doctor'

/** 高危因素枚举（与算法端 RiskEngineRequest.riskFactors 对齐） */
export type RiskFactorCode =
  | 'advanced_maternal_age' // 高龄
  | 'ivf' // 试管婴儿
  | 'twin' // 双胎
  | 'multiple' // 多胎
  | 'cervical_insufficiency' // 宫颈机能不全
  | 'preterm_history' // 早产史
  | 'tocolysis' // 保胎中
  | 'gdm' // 妊娠糖尿病
  | 'hypertension' // 妊娠高血压

export const RISK_FACTOR_LABELS: Record<RiskFactorCode, string> = {
  advanced_maternal_age: '高龄',
  ivf: '试管',
  twin: '双胎',
  multiple: '多胎',
  cervical_insufficiency: '宫颈机能不全',
  preterm_history: '早产史',
  tocolysis: '保胎中',
  gdm: '妊娠糖尿病',
  hypertension: '妊娠高血压'
}

/** 鉴权会话：角色由后端返回，前端不可篡改、会话期间不可切换 */
export interface AuthSession {
  token: string
  expiresAt: number
  userId: string
  role: UserRole
  displayName: string
}

/** 孕妇档案：孕周一律由 dueDate 与真实当前时间计算，禁止硬编码 */
export interface PatientProfile {
  patientId: string
  displayName: string
  dueDate: number // 预产期 Unix ms
  conceptionMethod: 'natural' | 'ivf'
  pregnancyType: 'singleton' | 'twin' | 'multiple'
  riskFactors: RiskFactorCode[]
  attendingDoctorId: string
  attendingDoctorName: string
  boundDeviceId: string | null
}
