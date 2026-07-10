import type { CliDefinition } from '../../shared/types'

const goose: CliDefinition = {
  id: 'goose',
  name: 'Goose CLI',
  executable: 'goose',
  dependencyType: 'standalone',
  description: 'Terminal AI agent by Block. Install via official Goose release',
  homepage: 'https://github.com/block/goose',
  skipPermissions: false,
}

export default goose
