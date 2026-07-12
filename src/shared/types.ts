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

export interface AppSettings {
  theme: 'light' | 'dark'
  cliOrder?: string[]
  favorites?: string[]
  terminalEmulator?: string
  yoloMode?: boolean
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
