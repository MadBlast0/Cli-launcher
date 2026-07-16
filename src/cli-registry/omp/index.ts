import type { CliDefinition } from '../../shared/types'

const omp: CliDefinition = {
  id: 'omp',
  name: 'Oh My Pi',
  executable: 'omp',
  packageName: '@oh-my-pi/pi-coding-agent',
  dependencyType: 'node',
  description: 'AI coding agent for the terminal with 32 built-in tools',
  homepage: 'https://github.com/can1357/oh-my-pi',
  skipPermissions: true,
  skipPermissionsFlag: '--auto-approve',
}

export default omp
