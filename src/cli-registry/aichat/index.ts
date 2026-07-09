import type { CliDefinition } from '../../shared/types'

const aichat: CliDefinition = {
  id: 'aichat',
  name: 'aichat',
  executable: 'aichat',
  dependencyType: 'standalone',
  description: 'All-in-one LLM CLI with chat REPL and shell assistant.',
  homepage: 'https://github.com/sigoden/aichat',
  skipPermissions: false,
}

export default aichat
