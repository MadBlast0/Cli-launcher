import type { CliDefinition } from '../../shared/types'

const hermes: CliDefinition = {
  id: 'hermes',
  name: 'Hermes Agent',
  executable: 'hermes',
  packageName: 'hermes-agent',
  dependencyType: 'python',
  description: 'Self-improving AI agent by Nous Research',
  homepage: 'https://hermes-agent.nousresearch.com',
  skipPermissions: true,
  skipPermissionsFlag: '--yolo',
}

export default hermes
