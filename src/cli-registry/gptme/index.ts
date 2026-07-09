import type { CliDefinition } from '../../shared/types'

const gptme: CliDefinition = {
  id: 'gptme',
  name: 'gptme',
  executable: 'gptme',
  packageName: 'gptme',
  dependencyType: 'python',
  description: 'Personal terminal AI agent with tools and shell access.',
  homepage: 'https://gptme.org',
  skipPermissions: false,
}

export default gptme
