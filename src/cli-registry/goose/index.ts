import type { CliDefinition } from '../../shared/types'

const goose: CliDefinition = {
  id: 'goose',
  name: 'Goose CLI',
  executable: 'goose',
  packageName: '@block/goose',
  dependencyType: 'node',
  description: 'Terminal AI agent by Block. Install via official Goose release',
  homepage: 'https://github.com/block/goose',
  skipPermissions: false,
}

export default goose
