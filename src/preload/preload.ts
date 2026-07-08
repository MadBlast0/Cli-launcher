import { contextBridge, ipcRenderer } from 'electron'

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
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
