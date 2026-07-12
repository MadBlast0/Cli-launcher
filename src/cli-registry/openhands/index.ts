import type { CliDefinition } from '../../shared/types'

const openhands: CliDefinition = {
  id: 'openhands',
  name: 'OpenHands CLI',
  executable: 'openhands',
  packageName: 'openhands-ai',
  dependencyType: 'python',
  description: 'Open-source autonomous coding agent (formerly OpenDevin).',
  homepage: 'https://github.com/All-Hands-AI/OpenHands',
  skipPermissions: true,
  skipPermissionsFlag: '--always-approve',
}

export default openhands
