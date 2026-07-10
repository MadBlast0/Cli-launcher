import { contextBridge, ipcRenderer } from 'electron'
import type { CliState, AppSettings, LaunchCliRequest, CliAction } from '../shared/types'

// Inlined channel names: the preload runs in a restricted Electron context
// (sandbox `preloadRequire`) that cannot resolve relative runtime imports like
// `../shared/constants`, so the string values are duplicated here instead.
const CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  CLI_REFRESH_ALL_STATES: 'cli:refresh-all-states',
  CLI_STATE_UPDATED: 'cli:state-updated',
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
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
