import { contextBridge, ipcRenderer } from 'electron'
import type { CliState, AppSettings, LaunchCliRequest, CliAction, AppUpdateInfo, AppUpdateStatus, ActionProgressMessage, RefreshProgressMessage } from '../shared/types'

// Inlined channel names: the preload runs in a restricted Electron context
// (sandbox `preloadRequire`) that cannot resolve relative runtime imports like
// `../shared/constants`, so the string values are duplicated here instead.
const CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  CLI_REFRESH_ALL_STATES: 'cli:refresh-all-states',
  CLI_STATE_UPDATED: 'cli:state-updated',
  CHECK_APP_UPDATE: 'app:check-update',
  DOWNLOAD_APP_UPDATE: 'app:download-update',
  INSTALL_APP_UPDATE: 'app:install-update',
  APP_UPDATE_STATUS: 'app:update-status',
} as const

const api = {
  getClis: () => ipcRenderer.invoke('cli:get-all'),
  getCliState: (cliId: string) => ipcRenderer.invoke('cli:get-state', cliId),
  getAllCliStates: () => ipcRenderer.invoke('cli:get-all-states'),
  executeAction: (cliId: string, action: CliAction) => ipcRenderer.invoke('cli:execute', cliId, action),
  launchCli: (request: LaunchCliRequest) => ipcRenderer.invoke('cli:launch', request),
  checkCliUpdate: (cliId: string) => ipcRenderer.invoke('cli:check-update', cliId),
  checkDependencies: () => ipcRenderer.invoke('deps:check'),
  installDependency: (type: 'node' | 'python') => ipcRenderer.invoke('deps:install', type),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  getSavedFolder: () => ipcRenderer.invoke('folder:get-saved'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:save', settings),
  minimizeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_CLOSE),
  refreshCliStates: () => ipcRenderer.invoke(CHANNELS.CLI_REFRESH_ALL_STATES),
  onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => {
    const handler = (_event: any, cliId: string, state: CliState) => callback(cliId, state)
    ipcRenderer.on(CHANNELS.CLI_STATE_UPDATED, handler)
    return () => { ipcRenderer.removeListener(CHANNELS.CLI_STATE_UPDATED, handler) }
  },
  checkForAppUpdate: () => ipcRenderer.invoke(CHANNELS.CHECK_APP_UPDATE) as Promise<AppUpdateInfo>,
  downloadAppUpdate: () => ipcRenderer.invoke(CHANNELS.DOWNLOAD_APP_UPDATE) as Promise<{ success: boolean; error?: string }>,
  installAppUpdate: () => ipcRenderer.invoke(CHANNELS.INSTALL_APP_UPDATE),
  onAppUpdateStatus: (callback: (status: AppUpdateStatus) => void) => {
    const handler = (_event: any, status: AppUpdateStatus) => callback(status)
    ipcRenderer.on(CHANNELS.APP_UPDATE_STATUS, handler)
    return () => { ipcRenderer.removeListener(CHANNELS.APP_UPDATE_STATUS, handler) }
  },
  cancelAction: (cliId: string) => ipcRenderer.invoke('cli:cancel-action', cliId),
  onActionProgress: (callback: (cliId: string, msg: ActionProgressMessage) => void) => {
    const handler = (_event: any, cliId: string, msg: ActionProgressMessage) => callback(cliId, msg)
    ipcRenderer.on('cli:action-progress', handler)
    return () => { ipcRenderer.removeListener('cli:action-progress', handler) }
  },
  onRefreshProgress: (callback: (msg: RefreshProgressMessage) => void) => {
    const handler = (_event: any, msg: RefreshProgressMessage) => callback(msg)
    ipcRenderer.on('cli:refresh-progress', handler)
    return () => { ipcRenderer.removeListener('cli:refresh-progress', handler) }
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
