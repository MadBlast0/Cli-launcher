import type { CliDefinition, CliState, CliActionResult, DependencyCheck } from '@shared/types'

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
      getAllCliStates: () => Promise<Record<string, CliState>>
      selectFolder: () => Promise<string | null>
      getSavedFolder: () => Promise<string | null>
      saveFolder: (folder: string) => Promise<void>
      minimizeWindow: () => void
      closeWindow: () => void
      refreshCliStates: () => void
      onCliStateUpdate: (callback: (cliId: string, state: CliState) => void) => () => void
    }
  }
}
