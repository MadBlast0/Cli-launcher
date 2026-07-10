import type { CliDefinition, CliState, CliActionResult, CliLaunchResult, DependencyCheck, AppSettings, LaunchCliRequest, CliAction } from '@shared/types'

declare global {
  interface Window {
    electronAPI: {
      getClis: () => Promise<CliDefinition[]>
      getCliState: (cliId: string) => Promise<CliState | null>
      getAllCliStates: () => Promise<Record<string, CliState>>
      executeAction: (cliId: string, action: CliAction) => Promise<CliActionResult>
      launchCli: (request: LaunchCliRequest) => Promise<CliLaunchResult>
      checkCliUpdate: (cliId: string) => Promise<{ updateAvailable: boolean; latestVersion?: string }>
      checkDependencies: () => Promise<DependencyCheck>
      installDependency: (type: 'node' | 'python') => Promise<string>
      selectFolder: () => Promise<string | null>
      getSavedFolder: () => Promise<string | null>
      getSettings: () => Promise<AppSettings>
      saveSettings: (settings: Partial<AppSettings>) => Promise<void>
      minimizeWindow: () => void
      closeWindow: () => void
      refreshCliStates: () => Promise<void>
      onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => () => void
    }
  }
}
