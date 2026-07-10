import type { CliDefinition } from '../../shared/types'

const pi: CliDefinition = {
  id: 'pi',
  name: 'PI Coding Agent',
  executable: 'pi',
  packageName: '@mariozechner/pi-coding-agent',
  dependencyType: 'node',
  description: 'Terminal AI coding agent by Mario Zechner',
  homepage: 'https://github.com/mariozechner/pi-coding-agent',
  skipPermissions: false,
}

export default pi
