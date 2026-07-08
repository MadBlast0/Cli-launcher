import type { CliDefinition } from '../../shared/types'

const opencode: CliDefinition = {
  id: 'opencode',
  name: 'OpenCode',
  executable: 'opencode',
  packageName: 'opencode-ai',
  dependencyType: 'node',
  description: 'Open-source AI coding agent that works in your terminal',
  homepage: 'https://opencode.ai',
  skipPermissions: true,
  skipPermissionsFlag: '--dangerously-skip-permissions',
}

export default opencode
