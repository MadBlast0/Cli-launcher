import type { CliDefinition } from '../../shared/types'

const freebuff: CliDefinition = {
  id: 'freebuff',
  name: 'Freebuff',
  executable: 'freebuff',
  packageName: 'freebuff',
  dependencyType: 'node',
  description: 'Free terminal AI agent from the Codebuff project',
  homepage: 'https://codebuff.com',
  skipPermissions: false,
}

export default freebuff
