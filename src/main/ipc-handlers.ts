import { ipcMain, dialog, app } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import { executeCliAction, openCli, checkCliUpdate } from './cli-engine'
import { checkDependencies, installNode, installPython } from './dependency-manager'
import { getCliRegistry } from '../cli-registry'
import { CliAction, CliState } from '../shared/types'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const cliStatusCache = new Map<string, CliState>()

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
      exec(`where.exe ${executable}`, { timeout: 5000 }, (err) => {
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

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_CLIS, () => getCliRegistry())

  ipcMain.handle(IPC_CHANNELS.GET_CLI_STATE, async (_event, cliId: string) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return null
    const state = await checkCliStatus(cliId, cli.executable)
    cliStatusCache.set(cliId, state)
    return state
  })

  ipcMain.handle(IPC_CHANNELS.GET_ALL_CLI_STATES, async () => {
    const registry = getCliRegistry()
    const results = await Promise.all(
      registry.map(async (cli) => {
        const state = await checkCliStatus(cli.id, cli.executable)
        cliStatusCache.set(cli.id, state)
        return [cli.id, state] as const
      })
    )
    return Object.fromEntries(results) as Record<string, CliState>
  })

  ipcMain.handle(IPC_CHANNELS.EXECUTE_ACTION, async (_event, cliId: string, action: CliAction) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return { success: false, output: '', error: 'Unknown CLI' }

    // "open" spawns a real terminal in the saved working folder (no ps1 script).
    if (action === 'open') {
      return openCli(cli, getSavedFolder())
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
}
