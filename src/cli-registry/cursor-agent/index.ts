import type { CliDefinition } from '../../shared/types'

const cursorAgentDef: CliDefinition = {
  id: 'cursor-agent',
  name: 'Cursor Agent',
  executable: 'cursor-agent',
  dependencyType: 'standalone',
  description: 'Cursor\'s headless AI coding agent for the terminal.',
  homepage: 'https://cursor.com/cli',
  skipPermissions: false,
  wslExecutable: true,
}

export default cursorAgentDef
