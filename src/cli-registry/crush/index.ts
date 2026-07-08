import type { CliDefinition } from '../../shared/types'

const crush: CliDefinition = {
  id: 'crush',
  name: 'Crush',
  executable: 'crush',
  packageName: '@charmland/crush',
  dependencyType: 'node',
  description: 'Terminal AI agent by Charmland',
  skipPermissions: false,
}

export default crush
