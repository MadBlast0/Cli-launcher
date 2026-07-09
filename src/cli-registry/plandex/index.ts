import type { CliDefinition } from '../../shared/types'

const plandex: CliDefinition = {
  id: 'plandex',
  name: 'Plandex',
  executable: 'plandex',
  dependencyType: 'standalone',
  description: 'Terminal AI agent for large, multi-step coding tasks.',
  homepage: 'https://plandex.ai',
  skipPermissions: false,
  wslExecutable: true,
}

export default plandex
