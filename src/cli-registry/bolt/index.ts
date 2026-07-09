import type { CliDefinition } from '../../shared/types'

const bolt: CliDefinition = {
  id: 'bolt',
  name: 'Bolt CLI',
  executable: 'bolt',
  packageName: '@bolt/cli',
  dependencyType: 'node',
  description: 'Terminal-based AI coding agent by Bolt',
  homepage: 'https://bolt.new',
  skipPermissions: false,
}

export default bolt
