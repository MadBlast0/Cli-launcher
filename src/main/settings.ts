import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { AppSettings, CliConfig } from '../shared/types'

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

/** Returns the per-CLI config for `cliId`, or undefined if none is set. */
export function getCliConfig(cliId: string): CliConfig | undefined {
  return readSettings().cliConfig?.[cliId]
}

/** Merges the per-CLI config for `cliId`. Pass `undefined` to clear it. */
export function setCliConfig(cliId: string, config: CliConfig | undefined): void {
  const settings = readSettings()
  const cliConfig = { ...(settings.cliConfig || {}) }
  if (config === undefined) delete cliConfig[cliId]
  else cliConfig[cliId] = config
  writeSettings({ ...settings, cliConfig })
}

/** Reads the user's preferred terminal emulator from saved settings, if any. */
export function getConfiguredTerminal(): string | null {
  const settings = readSettings()
  if (typeof settings.terminalEmulator === 'string' && settings.terminalEmulator) {
    return settings.terminalEmulator
  }
  return null
}
