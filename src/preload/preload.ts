import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import type { CliState, AppSettings, LaunchCliRequest, CliAction, AppUpdateInfo, AppUpdateStatus, ActionProgressMessage, RefreshProgressMessage, BulkProgressMessage } from '../shared/types'

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
  minimizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  refreshCliStates: () => ipcRenderer.invoke(IPC_CHANNELS.CLI_REFRESH_ALL_STATES),
  onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => {
    const handler = (_event: any, cliId: string, state: CliState) => callback(cliId, state)
    ipcRenderer.on(IPC_CHANNELS.CLI_STATE_UPDATED, handler)
    return () => { ipcRenderer.removeListener(IPC_CHANNELS.CLI_STATE_UPDATED, handler) }
  },
  checkForAppUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_APP_UPDATE) as Promise<AppUpdateInfo>,
  downloadAppUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_APP_UPDATE) as Promise<{ success: boolean; error?: string }>,
  installAppUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.INSTALL_APP_UPDATE),
  onAppUpdateStatus: (callback: (status: AppUpdateStatus) => void) => {
    const handler = (_event: any, status: AppUpdateStatus) => callback(status)
    ipcRenderer.on(IPC_CHANNELS.APP_UPDATE_STATUS, handler)
    return () => { ipcRenderer.removeListener(IPC_CHANNELS.APP_UPDATE_STATUS, handler) }
  },
  cancelAction: (cliId: string) => ipcRenderer.invoke('cli:cancel-action', cliId),
  bulkAction: (action: 'update' | 'repair') => ipcRenderer.invoke('cli:bulk-action', action),
  onBulkProgress: (callback: (msg: BulkProgressMessage) => void) => {
    const handler = (_event: any, msg: BulkProgressMessage) => callback(msg)
    ipcRenderer.on('cli:bulk-progress', handler)
    return () => { ipcRenderer.removeListener('cli:bulk-progress', handler) }
  },
  getActionLog: (cliId: string) => ipcRenderer.invoke('cli:get-action-log', cliId),
  openPath: (p: string) => ipcRenderer.invoke('app:open-path', p),
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
