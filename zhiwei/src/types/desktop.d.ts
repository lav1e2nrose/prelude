interface DesktopBridge {
  isDesktop: boolean
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  onWindowStateChange: (callback: (payload: { maximized: boolean }) => void) => () => void
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
