import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import { autoUpdater } from 'electron-updater'
import { executeCliAction, openCli, checkCliUpdate, isWindows, checkStandaloneUpdate, cancelAction } from './cli-engine'
import { qSH } from './terminal-serializers'
import { checkDependencies, installNode, installPython } from './dependency-manager'
import { getCliRegistry } from '../cli-registry'
import { CliAction, CliState, CliDefinition, AppSettings, LaunchCliRequest, LaunchErrorCode } from '../shared/types'
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

/**
 * Runs `<cmd> --version` and resolves with the trimmed first line, or `''`
 * when the command fails or prints nothing. An empty string is intentionally
 * NOT treated as "installed" (that was the previous bug).
 */
function getVersion(cmd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 8000 }, (err, stdout) => {
      if (err) { resolve(''); return }
      resolve(stdout.trim().split('\n')[0] || '')
    })
  })
}

/**
 * Authoritative global-package presence checks. Querying the package manager
 * (rather than relying on an inherited PATH) avoids the "installed but still
 * shows as missing" problem after an in-app install. Results are cached for
 * the process lifetime.
 */
const PKG_CACHE_TTL = 60000

let npmGlobalCache: { data: Set<string> | null; ts: number } = { data: null, ts: 0 }
let pipGlobalCache: { data: Set<string> | null; ts: number } = { data: null, ts: 0 }

// In-flight refresh promises used to dedupe concurrent cold-cache calls so a
// burst of `checkCliStatus` requests doesn't spawn many `npm ls -g` / `pip
// list` processes at once. If a refresh is already running, callers await it.
let npmGlobalRefresh: Promise<Set<string>> | null = null
let pipGlobalRefresh: Promise<Set<string>> | null = null

// `npm ls -g --json` / `pip list --json` routinely exceed the 1 MB default
// stdout buffer on machines with many global packages; without a raised
// maxBuffer the child errors with ENOBUFS, every CLI is misreported as
// not-installed, and (previously) that empty result was cached for the full
// TTL. We now use a generous buffer and only cache a *successful* parse so a
// transient failure retries on the next call instead of poisoning the cache.
const PKG_MAX_BUFFER = 16 * 1024 * 1024

async function npmGlobalPackages(): Promise<Set<string>> {
  if (npmGlobalCache.data && Date.now() - npmGlobalCache.ts < PKG_CACHE_TTL) {
    return npmGlobalCache.data
  }
  if (npmGlobalRefresh) return npmGlobalRefresh
  npmGlobalRefresh = (async () => {
    try {
      const result = await new Promise<Set<string> | null>((resolve) => {
        // `npm ls -g` exits non-zero when there are peer-dep warnings even though
        // it still prints valid JSON, so we parse stdout regardless of `err`.
        exec('npm ls -g --depth=0 --json', { timeout: 20000, maxBuffer: PKG_MAX_BUFFER }, (_err, stdout) => {
          if (!stdout) { resolve(null); return }
          try {
            const json = JSON.parse(stdout)
            const deps = json.dependencies || {}
            resolve(new Set<string>(Object.keys(deps)))
          } catch { resolve(null) }
        })
      })
      if (result) {
        npmGlobalCache.data = result
        npmGlobalCache.ts = Date.now()
        return result
      }
      return npmGlobalCache.data ?? new Set<string>()
    } finally {
      npmGlobalRefresh = null
    }
  })()
  return npmGlobalRefresh
}

async function pipGlobalPackages(): Promise<Set<string>> {
  if (pipGlobalCache.data && Date.now() - pipGlobalCache.ts < PKG_CACHE_TTL) {
    return pipGlobalCache.data
  }
  if (pipGlobalRefresh) return pipGlobalRefresh
  pipGlobalRefresh = (async () => {
    try {
      const result = await new Promise<Set<string> | null>((resolve) => {
        exec('pip list --format=json', { timeout: 20000, maxBuffer: PKG_MAX_BUFFER }, (_err, stdout) => {
          if (!stdout) { resolve(null); return }
          try {
            const list = JSON.parse(stdout)
            resolve(new Set<string>(list.map((p: { name: string }) => p.name)))
          } catch { resolve(null) }
        })
      })
      if (result) {
        pipGlobalCache.data = result
        pipGlobalCache.ts = Date.now()
        return result
      }
      return pipGlobalCache.data ?? new Set<string>()
    } finally {
      pipGlobalRefresh = null
    }
  })()
  return pipGlobalRefresh
}

async function checkCliStatus(cli: CliDefinition): Promise<CliState> {
  try {
    let version = ''

    // 1) Authoritative check via the package manager (npm/pip global).
    if (cli.dependencyType === 'node' && cli.packageName) {
      const globals = await npmGlobalPackages()
      if (globals.has(cli.packageName)) {
        version = (await getVersion(`${cli.executable} --version`)) || ''
      }
    } else if (cli.dependencyType === 'python' && cli.packageName) {
      const globals = await pipGlobalPackages()
      if (globals.has(cli.packageName)) {
        version = (await getVersion(`${cli.executable} --version`)) || ''
      }
    }

    // 2) For WSL-only CLIs, try WSL first... (executable POSIX-quoted for bash)
    if (!version && cli.wslExecutable && isWindows) {
      version = await getVersion(`wsl -e bash -lc "${qSH(cli.executable)} --version"`)
    }

    // 3) ...then fall back to a native PATH lookup (fixes Amazon Q installed
    //    natively rather than via WSL).
    if (!version) {
      const found = await new Promise<boolean>((resolve) => {
        const detector = isWindows ? 'where' : 'which'
        exec(`${detector} ${cli.executable}`, { timeout: 5000 }, (err) => resolve(!err))
      })
      if (found) version = (await getVersion(`${cli.executable} --version`)) || ''
    }

    if (!version) return { status: 'not-installed' }
    return { status: 'installed', version }
  } catch {
    return { status: 'not-installed' }
  }
}

/**
 * Runs `worker` over `items` with a bounded number of concurrent tasks so a
 * full status refresh never spawns dozens of child processes at once (that
 * caused a CPU/IO spike on startup with a large registry).
 */
async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++]
      await worker(item)
    }
  })
  await Promise.all(runners)
}

async function refreshAllStates(registry: CliDefinition[], sender: Electron.WebContents) {
  const freshStates: Record<string, CliState> = {}
  let completed = 0
  const total = registry.length

  await runPool(registry, 8, async (cli) => {
    const state = await checkCliStatus(cli)
    freshStates[cli.id] = state
    cliStatusCache.set(cli.id, state)
    completed++
    try {
      sender.send(IPC_CHANNELS.CLI_STATE_UPDATED, cli.id, state)
      sender.send(IPC_CHANNELS.CLI_REFRESH_PROGRESS, { current: cli.name, completed, total })
    } catch { /* window closed */ }
  })

  writeStateCache(freshStates)
}

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_CLIS, () => getCliRegistry())

  ipcMain.handle(IPC_CHANNELS.GET_CLI_STATE, async (event, cliId: string) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return null
    const state = await checkCliStatus(cli)
    cliStatusCache.set(cliId, state)
    try { event.sender.send(IPC_CHANNELS.CLI_STATE_UPDATED, cliId, state) } catch { /* window closed */ }
    return state
  })

  // Returns the persisted cache immediately for an instant first paint. The
  // renderer calls `cli:refresh-all-states` separately to get fresh values,
  // which stream back via the `cli:state-updated` event.
  ipcMain.handle(IPC_CHANNELS.GET_ALL_CLI_STATES, () => {
    return readStateCache()
  })

  let refreshInProgress = false

  ipcMain.handle(IPC_CHANNELS.CLI_REFRESH_ALL_STATES, async (event) => {
    if (refreshInProgress) return
    refreshInProgress = true
    try {
      const registry = getCliRegistry()
      const total = registry.length
      try { event.sender.send(IPC_CHANNELS.CLI_REFRESH_PROGRESS, { current: '', completed: 0, total }) } catch { /* window closed */ }
      await refreshAllStates(registry, event.sender)
    } finally {
      refreshInProgress = false
    }
  })

  ipcMain.handle(IPC_CHANNELS.CLI_CANCEL_ACTION, async (_event, cliId: string) => {
    return cancelAction(cliId)
  })

  // --- Dedicated launch IPC with full runtime validation ---
  ipcMain.handle(IPC_CHANNELS.LAUNCH_CLI, async (_event, request: LaunchCliRequest) => {
    // Guard against a null/non-object payload before touching its keys, so the
    // handler always returns a structured error instead of throwing/rejecting.
    if (!request || typeof request !== 'object') {
      return { success: false, output: '', error: 'Request must be an object', errorCode: 'INVALID_REQUEST' as LaunchErrorCode }
    }
    // Reject unexpected properties
    const allowed = new Set(['cliId', 'cwd', 'permissionMode'])
    for (const key of Object.keys(request)) {
      if (!allowed.has(key)) {
        return { success: false, output: '', error: 'Unexpected property: ' + key, errorCode: 'INVALID_REQUEST' as LaunchErrorCode }
      }
    }

    // Validate cliId
    if (typeof request.cliId !== 'string' || !request.cliId.trim()) {
      return { success: false, output: '', error: 'cliId must be a non-empty string', errorCode: 'INVALID_REQUEST' as LaunchErrorCode }
    }
    const cli = getCliRegistry().find((c) => c.id === request.cliId)
    if (!cli) {
      return { success: false, output: '', error: 'Unknown CLI: ' + request.cliId, errorCode: 'UNKNOWN_CLI' as LaunchErrorCode }
    }

    // Validate permissionMode
    if (request.permissionMode !== 'normal' && request.permissionMode !== 'dangerous') {
      return { success: false, output: '', error: 'permissionMode must be "normal" or "dangerous"', errorCode: 'INVALID_REQUEST' as LaunchErrorCode }
    }

    // Resolve and validate cwd
    const cwd = request.cwd || getSavedFolder()
    if (cwd) {
      try {
        const stat = fs.statSync(cwd)
        if (!stat.isDirectory()) {
          return { success: false, output: '', error: 'Working directory is not a directory', errorCode: 'INVALID_WORKING_DIRECTORY' as LaunchErrorCode }
        }
      } catch {
        return { success: false, output: '', error: 'Working directory does not exist', errorCode: 'INVALID_WORKING_DIRECTORY' as LaunchErrorCode }
      }
    }

    return openCli(cli, cwd, request.permissionMode)
  })

  // Only these actions map to a real registry script. Validating against an
  // allow-list stops a crafted `action` (e.g. `../../evil`) from being joined
  // into the script path and executed (path traversal → arbitrary script run).
  const VALID_ACTIONS = new Set<CliAction>(['install', 'update', 'uninstall', 'repair'])

  ipcMain.handle(IPC_CHANNELS.EXECUTE_ACTION, async (event, cliId: string, action: CliAction) => {
    const cli = getCliRegistry().find((c) => c.id === cliId)
    if (!cli) return { success: false, output: '', error: 'Unknown CLI' }
    if (!VALID_ACTIONS.has(action)) {
      return { success: false, output: '', error: `Invalid action: ${String(action)}` }
    }

    const result = await executeCliAction(cliId, action, (msg) => {
      try { event.sender.send(IPC_CHANNELS.CLI_ACTION_PROGRESS, cliId, msg) } catch { /* window closed */ }
    })
    if (result.success) {
      // Invalidate package-manager caches so the next check fetches fresh
      // data (otherwise a newly installed/uninstalled CLI is invisible for
      // the full TTL — the root cause of the 30-40s post-install delay).
      npmGlobalCache = { data: null, ts: 0 }
      pipGlobalCache = { data: null, ts: 0 }
      // Send a done signal so the renderer knows the action stream finished
      try { event.sender.send(IPC_CHANNELS.CLI_ACTION_PROGRESS, cliId, { type: 'progress', percent: 100, message: '__done__' }) } catch { /* window closed */ }
      const newState = await checkCliStatus(cli)
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
    if (type === 'python') return await installPython()
    // Reject anything else so an unexpected value can't silently trigger the
    // wrong (privileged) system installer.
    throw new Error(`Invalid dependency type: ${String(type)}`)
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

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return readSettings()
  })

  // Merge partial updates into the existing settings so a caller that saves
  // only one key (e.g. the theme) can never wipe the others (cliOrder,
  // terminalEmulator, favorites).
  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_event, settings: Partial<AppSettings>) => {
    const current = readSettings()
    writeSettings({ ...current, ...settings })
  })

  // --- App auto-update ---

  ipcMain.handle(IPC_CHANNELS.CHECK_APP_UPDATE, async () => {
    if (!app.isPackaged) {
      return { updateAvailable: false, error: 'Not available in development mode' }
    }
    try {
      const result = await autoUpdater.checkForUpdates()
      if (result?.updateInfo) {
        return {
          updateAvailable: true,
          version: result.updateInfo.version,
          releaseNotes: result.updateInfo.releaseNotes,
        }
      }
      return { updateAvailable: false }
    } catch {
      return { updateAvailable: false, error: 'Failed to check for updates' }
    }
  })

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_APP_UPDATE, async () => {
    if (!app.isPackaged) return { error: 'Not available in development mode' }
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.INSTALL_APP_UPDATE, () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.close()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.minimize()
  })
}
