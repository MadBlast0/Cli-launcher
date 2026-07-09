import type { CliDefinition } from '../../shared/types'

const droid: CliDefinition = {
  id: 'droid',
  name: 'Droid (Factory)',
  executable: 'droid',
  dependencyType: 'standalone',
  description: 'Factory AI\'s agentic software engineer in the terminal.',
  homepage: 'https://factory.ai',
  skipPermissions: false,
}

export default droid
