export type DependencyType = 'node' | 'python' | 'standalone'
export type CliAction = 'install' | 'update' | 'uninstall' | 'repair'
export type CliStatus = 'not-installed' | 'installed' | 'update-available' | 'error'

export interface CliDefinition {
  id: string
  name: string
  executable: string
  packageName?: string
  dependencyType: DependencyType
  description: string
  homepage?: string
  skipPermissions: boolean
  skipPermissionsFlag?: string
  wslExecutable?: boolean
  skipUpdateCheck?: boolean
}

export interface CliState {
  status: CliStatus
  version?: string
  latestVersion?: string
}

export interface CliActionResult {
  success: boolean
  output: string
  error?: string
}

export interface LaunchCliRequest {
  cliId: string
  cwd?: string
  permissionMode: 'normal' | 'dangerous'
}

export type LaunchErrorCode =
  | 'INVALID_REQUEST'
  | 'UNKNOWN_CLI'
  | 'INVALID_WORKING_DIRECTORY'
  | 'CLI_NOT_FOUND'
  | 'DANGEROUS_MODE_UNSUPPORTED'
  | 'TERMINAL_NOT_FOUND'
  | 'SPAWN_FAILED'
  | 'UNSUPPORTED_PLATFORM'

export interface CliLaunchResult {
  success: boolean
  output: string
  error?: string
  errorCode?: LaunchErrorCode
}

export interface DependencyCheck {
  node: { installed: boolean; version?: string }
  python: { installed: boolean; version?: string }
}

export interface CliConfig {
  /** Extra environment variables injected into the launched terminal/CLI
   *  process (e.g. `ANTHROPIC_API_KEY`). */
  env?: Record<string, string>
  /** Convenience model override, injected as `CLI_LAUNCHER_MODEL`. Map it to
   *  your CLI's real variable via the `env` map if it differs. */
  model?: string
  /** Convenience base-URL override, injected as `CLI_LAUNCHER_BASE_URL`. */
  baseUrl?: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  cliOrder?: string[]
  favorites?: string[]
  terminalEmulator?: string
  yoloMode?: boolean
  /** When true (default), global `npm`/`pip` installs that target a
   *  non-user-writable prefix are run via a graphical admin prompt on
   *  macOS/Linux. Set to false if you have configured a user-writable
   *  prefix (e.g. `npm config set prefix ~/.npm-global`). */
  elevateInstalls?: boolean
  /** Global keyboard shortcut (Electron accelerator, e.g. `Control+Space`) that
   *  shows/hides the window from anywhere. Empty/undefined falls back to the
   *  platform default. */
  globalHotkey?: string
  /** Keep the window above all others. */
  alwaysOnTop?: boolean
  /** Per-CLI configuration keyed by CLI id. */
  cliConfig?: Record<string, CliConfig>
  /** CLI ids hidden from the main grid (still manageable in the catalog). */
  hiddenClis?: string[]
  /** Display-name overrides keyed by CLI id (alias). */
  cliAlias?: Record<string, string>
}

export interface CliCount {
  cliId: string
  count: number
}

export interface AppUpdateInfo {
  updateAvailable: boolean
  version?: string
  releaseNotes?: string
  error?: string
}

export type AppUpdateStatusType = 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'

export interface AppUpdateStatus {
  type: AppUpdateStatusType
  version?: string
  progress?: number
  error?: string
}

export interface ActionProgressMessage {
  type: 'progress'
  percent?: number
  message: string
}

export interface RefreshProgressMessage {
  current: string
  completed: number
  total: number
}

export interface BulkProgressMessage {
  action: 'update' | 'repair'
  done: number
  total: number
  cliId?: string
  success?: boolean
}
