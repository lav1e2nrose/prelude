import { create } from 'zustand'
import type { MemorialModeState } from '../types/memorial'

const defaultPolicy = {
  legalRetentionYears: 5,
  visibility: 'hidden',
  alertShutdown: 'immediate',
  doctorArchiveStatus: 'ended'
} as const

const initialState: MemorialModeState = {
  enabled: false,
  outcomeType: null,
  activatedAt: null,
  activatedBy: null,
  userNote: null,
  dataRetention: { ...defaultPolicy },
  canUndoUntil: null,
  allowFutureReuse: null
}

interface MemorialStore {
  memorial: MemorialModeState
  enterMemorialMode: (activatedBy: MemorialModeState['activatedBy']) => void
  exitMemorialMode: () => void
}

export const useMemorialStore = create<MemorialStore>((set) => ({
  memorial: initialState,
  enterMemorialMode: (activatedBy) =>
    set(({ memorial }) => ({
      memorial: {
        ...memorial,
        enabled: true,
        activatedAt: Date.now(),
        activatedBy,
        canUndoUntil: Date.now() + 7 * 24 * 60 * 60 * 1000
      }
    })),
  exitMemorialMode: () =>
    set(({ memorial }) => ({
      memorial: {
        ...memorial,
        enabled: false,
        activatedAt: null,
        activatedBy: null,
        canUndoUntil: null
      }
    }))
}))
