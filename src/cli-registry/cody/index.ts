import type { CliDefinition } from '../../shared/types'

const cody: CliDefinition = {
  id: 'cody',
  name: 'Cody CLI',
  executable: 'cody',
  packageName: '@sourcegraph/cody',
  dependencyType: 'node',
  description: 'AI coding assistant from Sourcegraph that runs in your terminal',
  homepage: 'https://sourcegraph.com/cody',
  skipPermissions: false,
}

export default cody
