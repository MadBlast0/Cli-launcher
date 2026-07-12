import type { CliDefinition } from '../../shared/types'

const aider: CliDefinition = {
  id: 'aider',
  name: 'Aider',
  executable: 'aider',
  packageName: 'aider-chat',
  dependencyType: 'python',
  description: 'AI pair programming in the terminal. Uses Python/pip',
  homepage: 'https://aider.chat',
  skipPermissions: true,
  skipPermissionsFlag: '--yes-always',
}

export default aider
