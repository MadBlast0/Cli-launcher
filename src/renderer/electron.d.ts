import type { CliDefinition, CliState, CliActionResult, DependencyCheck, AppSettings } from '@shared/types'

interface TerminalOption {
  value: string
  label: string
}

declare global {
  interface Window {
    electronAPI: {
      getClis: () => Promise<CliDefinition[]>
      getCliState: (cliId: string) => Promise<CliState | null>
      getAllCliStates: () => Promise<Record<string, CliState>>
      executeAction: (cliId: string, action: string) => Promise<CliActionResult>
      checkCliUpdate: (cliId: string) => Promise<{ updateAvailable: boolean; latestVersion?: string }>
      checkDependencies: () => Promise<DependencyCheck>
      installDependency: (type: 'node' | 'python') => Promise<string>
      selectFolder: () => Promise<string | null>
      getSavedFolder: () => Promise<string | null>
      saveFolder: (folder: string) => Promise<void>
      getSettings: () => Promise<AppSettings>
      saveSettings: (settings: AppSettings) => Promise<void>
      installAllMissing: () => Promise<{ id: string; name: string; success: boolean; error?: string }[]>
      getAvailableTerminals: () => Promise<TerminalOption[]>
      minimizeWindow: () => void
      closeWindow: () => void
      minimizeToTray: () => void
      refreshCliStates: () => void
      onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => () => void
    }
  }
}
