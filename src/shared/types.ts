export type DependencyType = 'node' | 'python' | 'standalone'
export type CliAction = 'install' | 'update' | 'uninstall' | 'repair' | 'open'
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
}

export interface CliState {
  status: CliStatus
  version?: string
  latestVersion?: string
}

export interface CliActionRequest {
  cliId: string
  action: CliAction
}

export interface CliActionResult {
  success: boolean
  output: string
  error?: string
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
}

export interface CliCount {
  cliId: string
  count: number
}
