import { app, BrowserWindow, screen } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { WINDOW_CONFIG, APP_NAME } from '../shared/constants'

let mainWindow: BrowserWindow | null = null

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function createWindow() {
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize
  const width = Math.round(
    clamp(screenW * WINDOW_CONFIG.WIDTH_PCT, WINDOW_CONFIG.MIN_WIDTH, WINDOW_CONFIG.MAX_WIDTH)
  )
  // Lock to a 5:3 landscape aspect ratio; derive height from width.
  const height = Math.round((width * WINDOW_CONFIG.ASPECT_H) / WINDOW_CONFIG.ASPECT_W)

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
    icon: path.join(__dirname, '../../resources/icon.png'),
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

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

if (process.platform === 'win32') app.setAppUserModelId('com.cli-launcher.app')

app.whenReady().then(() => {
  createWindow()
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
