// 开发期演示账户目录（DEV ONLY）
// 生产部署时，登录与角色由后端鉴权服务返回；本文件仅在后端就绪前用于本地联调，
// 受 settings.devSettings 开发模式约束。角色由账户决定，登录后会话期间不可切换。

import type { AuthSession, PatientProfile } from '../types/user'

/** 受监测的孕妇档案（三端共享视角；真实部署来自后端档案服务） */
export const DEMO_PATIENT_PROFILE: PatientProfile = {
  patientId: 'patient-001',
  displayName: '张小雅',
  // 预产期固定为绝对日期 → 孕周由当前时间实时计算，组件内不出现硬编码孕周
  dueDate: Date.UTC(2026, 6, 22, 0, 0, 0), // 2026-07-22
  conceptionMethod: 'ivf',
  pregnancyType: 'singleton',
  riskFactors: ['advanced_maternal_age', 'ivf', 'cervical_insufficiency'],
  attendingDoctorId: 'doctor-wang',
  attendingDoctorName: '王主任',
  boundDeviceId: null
}

export interface DemoAccount {
  username: string
  password: string
  session: Omit<AuthSession, 'token' | 'expiresAt'>
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: 'patient',
    password: 'zhiwei',
    session: { userId: 'patient-001', role: 'patient', displayName: '张小雅' }
  },
  {
    username: 'family',
    password: 'zhiwei',
    session: { userId: 'guardian-chen', role: 'guardian', displayName: '陈先生' }
  },
  {
    username: 'doctor',
    password: 'zhiwei',
    session: { userId: 'doctor-wang', role: 'doctor', displayName: '王主任' }
  }
]

const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12h

/** 校验演示凭据，成功返回完整会话；失败返回 null。 */
export const authenticateDemo = (username: string, password: string): AuthSession | null => {
  const match = DEMO_ACCOUNTS.find(
    (account) => account.username === username.trim() && account.password === password
  )
  if (!match) return null
  return {
    ...match.session,
    token: `demo-${match.session.userId}-${Date.now()}`,
    expiresAt: Date.now() + SESSION_TTL_MS
  }
}
