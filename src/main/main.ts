import { app, BrowserWindow, screen, nativeImage, Tray, Menu } from 'electron'
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
  const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
  return path.join(__dirname, '../../resources', iconFile)
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

  mainWindow.setMenuBarVisibility(false)

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const prefix = ['info', 'warn', 'error', 'debug'][level] || 'log'
    console.log(`[renderer:${prefix}] ${message} (${sourceId}:${line})`)
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
  // Auto-update: checks GitHub releases for newer versions
  try {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'MadBlast0',
      repo: 'Cli-launcher',
    })
    autoUpdater.checkForUpdatesAndNotify()
    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall()
    })
  } catch { /* electron-updater not installed */ }
}

if (process.platform === 'win32') app.setAppUserModelId('com.cli-launcher.app')

app.whenReady().then(() => {
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
