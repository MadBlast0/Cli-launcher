import { contextBridge, ipcRenderer } from 'electron'
import type { CliState, AppSettings } from '../shared/types'

const api = {
  getClis: () => ipcRenderer.invoke('cli:get-all'),
  getCliState: (cliId: string) => ipcRenderer.invoke('cli:get-state', cliId),
  getAllCliStates: () => ipcRenderer.invoke('cli:get-all-states'),
  executeAction: (cliId: string, action: string) => ipcRenderer.invoke('cli:execute', cliId, action),
  checkCliUpdate: (cliId: string) => ipcRenderer.invoke('cli:check-update', cliId),
  checkDependencies: () => ipcRenderer.invoke('deps:check'),
  installDependency: (type: 'node' | 'python') => ipcRenderer.invoke('deps:install', type),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  getSavedFolder: () => ipcRenderer.invoke('folder:get-saved'),
  saveFolder: (folder: string) => ipcRenderer.invoke('folder:save', folder),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('settings:save', settings),
  installAllMissing: () => ipcRenderer.invoke('cli:install-all-missing'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  minimizeToTray: () => ipcRenderer.send('window:minimize-to-tray'),
  refreshCliStates: () => ipcRenderer.send('cli:refresh-all-states'),
  onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => {
    const handler = (_event: any, cliId: string, state: CliState) => callback(cliId, state)
    ipcRenderer.on('cli:state-updated', handler)
    return () => { ipcRenderer.removeListener('cli:state-updated', handler) }
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
