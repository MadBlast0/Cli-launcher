import type { CliDefinition } from '../../shared/types'

const codex: CliDefinition = {
  id: 'codex',
  name: 'Codex CLI',
  executable: 'codex',
  packageName: '@openai/codex',
  dependencyType: 'node',
  description: 'OpenAI\'s terminal AI coding agent',
  homepage: 'https://github.com/openai/codex',
  skipPermissions: true,
  skipPermissionsFlag: '--dangerously-bypass-approvals-and-sandbox',
}

export default codex
