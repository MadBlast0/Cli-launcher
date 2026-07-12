import type { CliDefinition } from '../../shared/types'

const claude: CliDefinition = {
  id: 'claude',
  name: 'Claude Code',
  executable: 'claude',
  packageName: '@anthropic-ai/claude-code',
  dependencyType: 'node',
  description: 'Anthropic\'s AI coding agent powered by Claude',
  homepage: 'https://docs.anthropic.com/en/docs/claude-code',
  skipPermissions: true,
  skipPermissionsFlag: '--dangerously-skip-permissions',
}

export default claude
