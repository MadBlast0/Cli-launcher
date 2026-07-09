import type { CliDefinition } from '../../shared/types'

const interpreter: CliDefinition = {
  id: 'interpreter',
  name: 'Open Interpreter',
  executable: 'interpreter',
  packageName: 'open-interpreter',
  dependencyType: 'python',
  description: 'Natural-language code execution in your terminal.',
  homepage: 'https://openinterpreter.com',
  skipPermissions: false,
}

export default interpreter
