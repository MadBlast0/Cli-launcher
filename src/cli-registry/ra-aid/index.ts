import type { CliDefinition } from '../../shared/types'

const raAidDef: CliDefinition = {
  id: 'ra-aid',
  name: 'RA.Aid',
  executable: 'ra-aid',
  packageName: 'ra-aid',
  dependencyType: 'python',
  description: 'Autonomous research and coding agent.',
  homepage: 'https://github.com/ai-christianson/RA.Aid',
  skipPermissions: true,
  skipPermissionsFlag: '--cowboy-mode',
}

export default raAidDef
