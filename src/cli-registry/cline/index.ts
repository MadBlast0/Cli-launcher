import type { CliDefinition } from '../../shared/types'

const cline: CliDefinition = {
  id: 'cline',
  name: 'Cline',
  executable: 'cline',
  packageName: 'cline',
  dependencyType: 'node',
  description: 'AI coding agent that runs in your terminal with code execution capabilities',
  homepage: 'https://cline.bot',
  skipPermissions: true,
  skipPermissionsFlag: '--dangerously-skip-permissions',
}

export default cline
