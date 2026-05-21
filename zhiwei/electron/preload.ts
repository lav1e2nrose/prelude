import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('zhiwei', {
  version: '0.0.0'
})
