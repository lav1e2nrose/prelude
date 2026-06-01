import { create } from 'zustand'

export interface ConfirmOptions {
  title: string
  body?: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

interface DialogState {
  open: boolean
  options: ConfirmOptions | null
  resolver: ((value: boolean) => void) | null
  _open: (options: ConfirmOptions, resolver: (value: boolean) => void) => void
  resolve: (value: boolean) => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  open: false,
  options: null,
  resolver: null,
  _open: (options, resolver) => {
    // 若已有未决对话框，先以取消结算，避免悬挂的 Promise
    const prev = get().resolver
    if (prev) prev(false)
    set({ open: true, options, resolver })
  },
  resolve: (value) => {
    const { resolver } = get()
    resolver?.(value)
    set({ open: false, options: null, resolver: null })
  }
}))

/** 以 Promise 形式弹出确认框：const ok = await confirmDialog({...}) */
export const confirmDialog = (options: ConfirmOptions): Promise<boolean> =>
  new Promise((resolve) => useDialogStore.getState()._open(options, resolve))
