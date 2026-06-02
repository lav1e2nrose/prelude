import { create } from 'zustand'

export type ToastKind = 'info' | 'success' | 'attention' | 'alert'

export interface ToastItem {
  id: string
  kind: ToastKind
  title: string
  description?: string
  /** 自动消失毫秒数；0 表示不自动消失 */
  duration: number
  createdAt: number
}

interface ToastStore {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, 'id' | 'createdAt' | 'duration'> & { duration?: number }) => string
  dismiss: (id: string) => void
}

const MAX_TOASTS = 3

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: ({ kind, title, description, duration = 3200 }) => {
    const id = `toast-${Date.now()}-${Math.round(Math.random() * 1000)}`
    set((state) => ({
      // 队列最多 3 条，超出丢弃最旧
      toasts: [...state.toasts, { id, kind, title, description, duration, createdAt: Date.now() }].slice(-MAX_TOASTS)
    }))
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))

/** 便捷调用：toast.success('已记录') */
export const toast = {
  info: (title: string, description?: string) => useToastStore.getState().push({ kind: 'info', title, description }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'success', title, description }),
  attention: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'attention', title, description }),
  alert: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'alert', title, description, duration: 5000 })
}
