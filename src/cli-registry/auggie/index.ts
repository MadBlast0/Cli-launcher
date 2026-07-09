import type { CliDefinition } from '../../shared/types'

const auggie: CliDefinition = {
  id: 'auggie',
  name: 'Auggie',
  executable: 'auggie',
  packageName: '@augmentcode/auggie',
  dependencyType: 'node',
  description: 'Augment Code\'s terminal agent with deep codebase context.',
  homepage: 'https://augmentcode.com',
  skipPermissions: false,
}

export default auggie
