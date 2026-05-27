let memorialModeEnabled = false
let memorialAlertSuppressor: (() => void) | null = null

export const isMemorialModeEnabled = () => memorialModeEnabled

export const setMemorialModeEnabled = (enabled: boolean) => {
  memorialModeEnabled = enabled
}

export const registerMemorialAlertSuppressor = (handler: () => void) => {
  memorialAlertSuppressor = handler
}

export const suppressAlertsForMemorialMode = () => {
  memorialAlertSuppressor?.()
}
