import type { CliDefinition } from '../../shared/types'

const amp: CliDefinition = {
  id: 'amp',
  name: 'Amp CLI',
  executable: 'amp',
  packageName: '@sourcegraph/amp',
  dependencyType: 'node',
  description: 'Sourcegraph\'s agentic coding tool for the terminal',
  homepage: 'https://ampcode.com',
  skipPermissions: false,
}

export default amp
