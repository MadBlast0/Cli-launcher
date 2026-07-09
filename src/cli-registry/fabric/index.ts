import type { CliDefinition } from '../../shared/types'

const fabric: CliDefinition = {
  id: 'fabric',
  name: 'Fabric',
  executable: 'fabric',
  dependencyType: 'standalone',
  description: 'Pattern-based AI framework for the command line.',
  homepage: 'https://github.com/danielmiessler/fabric',
  skipPermissions: false,
}

export default fabric
