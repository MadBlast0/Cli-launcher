import type { CliDefinition } from '../../shared/types'

const codebuff: CliDefinition = {
  id: 'codebuff',
  name: 'Codebuff',
  executable: 'codebuff',
  packageName: 'codebuff',
  dependencyType: 'node',
  description: 'AI agent that writes, fixes, and explains your code',
  homepage: 'https://codebuff.com',
  skipPermissions: false,
}

export default codebuff
