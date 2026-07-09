import type { CliDefinition } from '../../shared/types'

const ski: CliDefinition = {
  id: 'ski',
  name: 'Sketch',
  executable: 'ski',
  packageName: 'ski-cli',
  dependencyType: 'node',
  description: 'Terminal-based AI coding agent and sketch tool',
  homepage: 'https://ski.dev',
  skipPermissions: false,
}

export default ski
