interface DesktopBridge {
  isDesktop: boolean
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  onWindowStateChange: (callback: (payload: { maximized: boolean }) => void) => () => void
  devices?: {
    scanBLE?: () => Promise<import('../data/IDataSource').DeviceInfo[]>
    connectBLE: (config?: Record<string, unknown>) => Promise<void>
    disconnectBLE: () => Promise<void>
    sendBLEControl?: (cmd: import('../data/IDataSource').DeviceControlCommand) => Promise<void>
    onBLEFrame: (callback: (frame: import('./signal').EHGFrame) => void) => () => void
    onBLEStatus: (
      callback: (status: import('../data/IDataSource').ConnectionStatus) => void
    ) => () => void
    onBLEError: (callback: (message: string) => void) => () => void
  }
}

interface ZhiweiBridge {
  version: string
  desktop?: DesktopBridge
}

declare global {
  interface Window {
    zhiwei?: ZhiweiBridge
  }
}

export {}
