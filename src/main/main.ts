import { app, BrowserWindow, screen, nativeImage, Tray, Menu, shell, session } from 'electron'
import path from 'path'
import { registerIpcHandlers, applyInitialWindowSettings, unregisterHotkey } from './ipc-handlers'
import { readSettings } from './settings'
import { getCliRegistry } from '../cli-registry'
import { openCli } from './cli-engine'
import { WINDOW_CONFIG, APP_NAME, IPC_CHANNELS } from '../shared/constants'
import type { AppUpdateStatus } from '../shared/types'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getIconPath(): string {
  const iconFile =
    process.platform === 'win32'
      ? 'icon.ico'
      : process.platform === 'darwin'
        ? 'icon.icns'
        : 'icon.png'
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../../resources')
  return path.join(base, iconFile)
}

function buildTrayMenu(): Menu {
  const settings = readSettings()
  const favorites = settings.favorites || []
  const registry = getCliRegistry()
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Show CLI Launcher',
      click: () => { mainWindow?.show(); mainWindow?.focus() },
    },
  ]

  if (favorites.length > 0) {
    template.push({ type: 'separator' })
    template.push({ label: 'Launch favorites', enabled: false })
    for (const id of favorites) {
      const cli = registry.find((c) => c.id === id)
      if (!cli) continue
      template.push({
        label: cli.name,
        click: () => {
          openCli(cli, null, settings.yoloMode ? 'dangerous' : 'normal')
        },
      })
    }
  }

  template.push({ type: 'separator' })
  template.push({
    label: 'Quit',
    click: () => { isQuitting = true; app.quit() },
  })
  return Menu.buildFromTemplate(template)
}

function createTray() {
  const iconPath = getIconPath()
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }))
    tray.setToolTip(APP_NAME)
    tray.setContextMenu(buildTrayMenu())
    tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus() })
  } catch { /* tray not supported */ }
}

/** Rebuilds the tray menu after favorites change (called from settings save). */
export function rebuildTrayMenu(): void {
  if (tray) tray.setContextMenu(buildTrayMenu())
}

function createWindow() {
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize
  const width = Math.round(
    clamp(screenW * WINDOW_CONFIG.WIDTH_PCT, WINDOW_CONFIG.MIN_WIDTH, WINDOW_CONFIG.MAX_WIDTH)
  )
  // Lock to a 5:3 landscape aspect ratio; derive height from width.
  const height = Math.round((width * WINDOW_CONFIG.ASPECT_H) / WINDOW_CONFIG.ASPECT_W)

  const appIcon = nativeImage.createFromPath(getIconPath())

  mainWindow = new BrowserWindow({
    width,
    height,
    resizable: false,
    frame: false,
    // Transparent frameless windows are not rounded by the Windows 11
    // compositor, so this gives us sharp square corners.
    transparent: true,
    hasShadow: false,
    center: true,
    title: APP_NAME,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setIcon(appIcon)
  mainWindow.setMenuBarVisibility(false)

  // Security: never let the renderer open new windows in-app or navigate away
  // from the app shell. External http(s) links are handed to the OS browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devUrl = 'http://localhost:5173'
    if (process.env.NODE_ENV === 'development' && url.startsWith(devUrl)) return
    event.preventDefault()
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
  })

  // The `console-message` event receives positional args (level, message,
  // lineNumber, sourceId) — the first arg is the Event object and carries no
  // useful data, so we use the positional fallback directly.
  mainWindow.webContents.on('console-message', (...cmArgs: any[]) => {
    const d = { level: cmArgs[1], message: cmArgs[2], line: cmArgs[3], sourceId: cmArgs[4] }
    const levels: Record<string, string> = { 0: 'verbose', 1: 'info', 2: 'warning', 3: 'error', 4: 'debug' }
    const prefix = levels[d.level] ?? String(d.level ?? 'log')
    console.log(`[renderer:${prefix}] ${d.message} (${d.sourceId}:${d.line})`)
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`[main] failed to load: ${errorDescription} (${errorCode})`)
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

let autoUpdaterInitialized = false

function initAutoUpdater() {
  if (autoUpdaterInitialized) return
  autoUpdaterInitialized = true
  if (!app.isPackaged) return
  try {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'MadBlast0',
      repo: 'Cli-launcher',
    })
    autoUpdater.autoDownload = false

    autoUpdater.on('checking-for-update', () => {
      sendUpdateStatus({ type: 'checking' })
    })

    autoUpdater.on('update-available', (info: any) => {
      sendUpdateStatus({ type: 'available', version: info.version })
    })

    autoUpdater.on('update-not-available', () => {
      sendUpdateStatus({ type: 'not-available' })
    })

    autoUpdater.on('download-progress', (progress: any) => {
      sendUpdateStatus({ type: 'downloading', progress: progress.percent })
    })

    autoUpdater.on('update-downloaded', (info: any) => {
      sendUpdateStatus({ type: 'downloaded', version: info.version })
    })

    autoUpdater.on('error', (err: any) => {
      sendUpdateStatus({ type: 'error', error: err?.message ?? String(err) })
    })

    setTimeout(() => autoUpdater.checkForUpdates(), 3000)
    setInterval(() => autoUpdater.checkForUpdates(), 6 * 60 * 60 * 1000)
  } catch { /* electron-updater not installed */ }
}

function sendUpdateStatus(status: AppUpdateStatus) {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) win.webContents.send(IPC_CHANNELS.APP_UPDATE_STATUS, status)
}

if (process.platform === 'win32') app.setAppUserModelId('com.cli-launcher.app')

/**
 * Content-Security-Policy for the renderer. Applied only in packaged builds —
 * in development Vite serves over http with HMR (websocket + eval for
 * react-refresh), which a strict policy would break. The production renderer
 * loads everything from the bundled `file://` origin, so `'self'` is enough.
 */
function applyContentSecurityPolicy() {
  if (!app.isPackaged) return
  const csp =
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "base-uri 'none'; " +
    "form-action 'none'; " +
    "object-src 'none'"
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    })
  })
}

app.whenReady().then(() => {
  applyContentSecurityPolicy()
  createWindow()
  createTray()
  registerIpcHandlers()
  // Restore global hotkey + always-on-top from saved settings (the window must
  // already exist so always-on-top can be applied to it).
  applyInitialWindowSettings()
  initAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

// --- Single-instance lock (#4) ---
// Only one window should ever exist. A second launch focuses the existing one.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (tray) {
      // Keep running in tray on Windows/Linux
    } else {
      app.quit()
    }
  }
})

app.on('before-quit', () => {
  isQuitting = true
  unregisterHotkey()
})
