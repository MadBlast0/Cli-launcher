import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import { executeCliAction, openCli, checkCliUpdate, isWindows, checkStandaloneUpdate } from './cli-engine'
import { checkDependencies, installNode, installPython } from './dependency-manager'
import { getCliRegistry } from '../cli-registry'
import { CliAction, CliState, CliDefinition, AppSettings } from '../shared/types'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const cliStatusCache = new Map<string, CliState>()
const STATE_CACHE_FILE = 'cli-state-cache.json'
const SETTINGS_FILE = 'settings.json'

function getStateCachePath() {
  return path.join(app.getPath('userData'), STATE_CACHE_FILE)
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), SETTINGS_FILE)
}

function readSettings(): AppSettings {
  try {
    const p = getSettingsPath()
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch { /* ignore */ }
  return { theme: 'dark' }
}

function writeSettings(settings: AppSettings) {
  try {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
  } catch { /* ignore */ }
}

function readStateCache(): Record<string, CliState> {
  try {
    const p = getStateCachePath()
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch { /* ignore */ }
  return {}
}

function writeStateCache(cache: Record<string, CliState>) {
  try {
    fs.writeFileSync(getStateCachePath(), JSON.stringify(cache), 'utf-8')
  } catch { /* ignore */ }
}

function getFolderPath() {
  return path.join(app.getPath('userData'), 'lastfolder.txt')
}

function getSavedFolder(): string | null {
  try {
    const p = getFolderPath()
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8').trim()
    }
  } catch { /* ignore */ }
  return null
}

function saveFolder(folder: string) {
  try {
    fs.writeFileSync(getFolderPath(), folder, 'utf-8')
  } catch { /* ignore */ }
}

async function checkCliStatus(cliId: string, executable: string): Promise<CliState> {
  try {
    const version = await new Promise<string>((resolve) => {
      const which = isWindows ? 'where' : 'which'
      exec(`${which} ${executable}`, { timeout: 5000 }, (err) => {
        if (err) { resolve(''); return }
        exec(`${executable} --version`, { timeout: 5000 }, (_err, stdout) => {
          resolve(stdout.trim().split('\n')[0] || 'installed')
        })
      })
    })
    if (!version) return { status: 'not-installed' }
    return { status: 'installed', version }
  } catch {
    return { status: 'not-installed' }
  }
}

async function refreshAllStates(registry: CliDefinition[], sender: Electron.WebContents) {
  const freshStates: Record<string, CliState> = {}

  await Promise.all(
    registry.map(async (cli) => {
      const state = await checkCliStatus(cli.id, cli.executable)
      freshStates[cli.id] = state
      cliStatusCache.set(cli.id, state)
      try { sender.send('cli:state-updated', cli.id, state) } catch { /* window closed */ }
    })
  )

  writeStateCache(freshStates)
}

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_CLIS, () => getCliRegistry())

  ipcMain.handle(IPC_CHANNELS.GET_CLI_STATE, async (_event, cliId: string) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return null
    const state = await checkCliStatus(cliId, cli.executable)
    cliStatusCache.set(cliId, state)
    return state
  })

  ipcMain.handle(IPC_CHANNELS.GET_ALL_CLI_STATES, async (event) => {
    const registry = getCliRegistry()
    const cached = readStateCache()
    const sender = event.sender
    refreshAllStates(registry, sender)
    return cached
  })

  ipcMain.on('cli:refresh-all-states', (event) => {
    const registry = getCliRegistry()
    refreshAllStates(registry, event.sender)
  })

  ipcMain.handle(IPC_CHANNELS.EXECUTE_ACTION, async (_event, cliId: string, action: CliAction) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return { success: false, output: '', error: 'Unknown CLI' }

    if (action === 'open') {
      const settings = readSettings()
      return openCli(cli, getSavedFolder(), settings.terminalEmulator)
    }

    const result = await executeCliAction(cliId, action)
    if (result.success) {
      const newState = await checkCliStatus(cliId, cli.executable)
      cliStatusCache.set(cliId, newState)
    }
    return result
  })

  ipcMain.handle(IPC_CHANNELS.CHECK_CLI_UPDATE, async (_event, cliId: string) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return { updateAvailable: false }
    if (cli.dependencyType === 'standalone') {
      return await checkStandaloneUpdate(cli)
    }
    return await checkCliUpdate(cli)
  })

  ipcMain.handle(IPC_CHANNELS.CHECK_DEPENDENCIES, async () => {
    return await checkDependencies()
  })

  ipcMain.handle(IPC_CHANNELS.INSTALL_DEPENDENCY, async (_event, type: 'node' | 'python') => {
    if (type === 'node') return await installNode()
    return await installPython()
  })

  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: getSavedFolder() || undefined,
    })
    if (!result.canceled && result.filePaths.length > 0) {
      saveFolder(result.filePaths[0])
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle(IPC_CHANNELS.GET_SAVED_FOLDER, () => {
    return getSavedFolder()
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_FOLDER, (_event, folder: string) => {
    saveFolder(folder)
  })

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return readSettings()
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_event, settings: AppSettings) => {
    writeSettings(settings)
  })

  ipcMain.handle(IPC_CHANNELS.INSTALL_ALL_MISSING, async (event) => {
    const registry = getCliRegistry()
    const results: { id: string; name: string; success: boolean; error?: string }[] = []
    for (const cli of registry) {
      const state = await checkCliStatus(cli.id, cli.executable)
      if (state.status === 'not-installed') {
        const result = await executeCliAction(cli.id, 'install')
        results.push({ id: cli.id, name: cli.name, success: result.success, error: result.error })
        try { event.sender.send('cli:state-updated', cli.id, await checkCliStatus(cli.id, cli.executable)) } catch { /* ignore */ }
      }
    }
    return results
  })

  ipcMain.on('window:close', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.close()
  })

  ipcMain.on('window:minimize', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.minimize()
  })

  ipcMain.on('window:minimize-to-tray', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.hide()
  })
}
