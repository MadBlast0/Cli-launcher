import type { CliDefinition } from '../../shared/types'

const gemini: CliDefinition = {
  id: 'gemini',
  name: 'Gemini CLI',
  executable: 'gemini',
  packageName: '@google/gemini-cli',
  dependencyType: 'node',
  description: 'Google\'s AI coding agent in the terminal',
  homepage: 'https://github.com/google-gemini/gemini-cli',
  skipPermissions: true,
  skipPermissionsFlag: '--yolo',
}

export default gemini
