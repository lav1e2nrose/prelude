export type UserRole = 'patient' | 'guardian' | 'doctor'

export interface PatientProfile {
  id: string
  name: string
  gestationalWeek: number
  riskFactors: string[]
  primaryDoctor: string
}

export interface GuardianProfile {
  id: string
  name: string
  relationship: string
}

export interface DoctorProfile {
  id: string
  name: string
  department: string
}

export type AppUser =
  | ({ role: 'patient' } & PatientProfile)
  | ({ role: 'guardian' } & GuardianProfile)
  | ({ role: 'doctor' } & DoctorProfile)
