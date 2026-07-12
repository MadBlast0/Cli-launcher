import type { CliDefinition } from '../../shared/types'

const copilot: CliDefinition = {
  id: 'copilot',
  name: 'GitHub Copilot CLI',
  executable: 'copilot',
  packageName: '@github/copilot',
  dependencyType: 'node',
  description: 'GitHub Copilot in your terminal. Requires Node.js 22+',
  homepage: 'https://github.com/github/copilot-cli',
  skipPermissions: true,
  skipPermissionsFlag: '--yolo',
}

export default copilot
