import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { AppSettings } from '../shared/types'

const SETTINGS_FILE = 'settings.json'

export function getSettingsPath(): string {
  return path.join(app.getPath('userData'), SETTINGS_FILE)
}

export function readSettings(): AppSettings {
  try {
    const p = getSettingsPath()
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch { /* ignore */ }
  return { theme: 'dark' }
}

export function writeSettings(settings: AppSettings): void {
  try {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
  } catch { /* ignore */ }
}

/** Reads the user's preferred terminal emulator from saved settings, if any. */
export function getConfiguredTerminal(): string | null {
  const settings = readSettings()
  if (typeof settings.terminalEmulator === 'string' && settings.terminalEmulator) {
    return settings.terminalEmulator
  }
  return null
}
