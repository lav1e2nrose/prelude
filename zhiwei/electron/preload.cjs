const { contextBridge, ipcRenderer } = require('electron')
const { version } = require('../package.json')

contextBridge.exposeInMainWorld('zhiwei', {
  version,
  desktop: {
    isDesktop: true,
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    onWindowStateChange: (callback) => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('window:state', listener)
      return () => {
        ipcRenderer.removeListener('window:state', listener)
      }
    }
  }
})
