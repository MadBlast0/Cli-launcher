import type { CliDefinition } from '../../shared/types'

const kilo: CliDefinition = {
  id: 'kilo',
  name: 'Kilo CLI',
  executable: 'kilo',
  packageName: '@kilocode/cli',
  dependencyType: 'node',
  description: 'AI coding agent by Kilo Code',
  homepage: 'https://github.com/kilocode/kilocode',
  skipPermissions: false,
}

export default kilo
