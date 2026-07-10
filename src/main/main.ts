import { app, BrowserWindow, screen, nativeImage, Tray, Menu, shell, session } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { WINDOW_CONFIG, APP_NAME } from '../shared/constants'

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

function createTray() {
  const iconPath = getIconPath()
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }))
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show CLI Launcher',
        click: () => { mainWindow?.show(); mainWindow?.focus() },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => { isQuitting = true; app.quit() },
      },
    ])
    tray.setToolTip(APP_NAME)
    tray.setContextMenu(contextMenu)
    tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus() })
  } catch { /* tray not supported */ }
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

  // Handle both the legacy positional signature and the newer details-object
  // form (Electron changed this API), so log forwarding survives upgrades.
  mainWindow.webContents.on('console-message', (...cmArgs: any[]) => {
    const d = cmArgs[0] && typeof cmArgs[0] === 'object' && 'message' in cmArgs[0]
      ? { level: cmArgs[0].level, message: cmArgs[0].message, line: cmArgs[0].lineNumber, sourceId: cmArgs[0].sourceId }
      : { level: cmArgs[1], message: cmArgs[2], line: cmArgs[3], sourceId: cmArgs[4] }
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

function checkForUpdates() {
  // Only check for updates in packaged builds (skip during development).
  if (!app.isPackaged) return
  // Auto-update: notifies the user about newer GitHub releases. The user
  // decides whether to install via the notification (no forced restart).
  try {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'MadBlast0',
      repo: 'Cli-launcher',
    })
    autoUpdater.checkForUpdatesAndNotify()
  } catch { /* electron-updater not installed */ }
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
  checkForUpdates()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

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
})
