import type { CliDefinition } from '../../shared/types'

const continueDef: CliDefinition = {
  id: 'continue',
  name: 'Continue CLI',
  executable: 'cn',
  packageName: '@continuedev/cli',
  dependencyType: 'node',
  description: 'Open-source terminal coding agent by Continue.',
  homepage: 'https://continue.dev',
  skipPermissions: false,
}

export default continueDef
