import type { CliDefinition } from '../../shared/types'

const commandcode: CliDefinition = {
  id: 'commandcode',
  name: 'Command Code',
  // The npm package also exposes the short alias `cmd`, but that collides with
  // the Windows built-in cmd.exe, so we detect/launch via the full name.
  executable: 'command-code',
  packageName: 'command-code',
  dependencyType: 'node',
  description: 'Terminal coding agent that learns your taste',
  homepage: 'https://commandcode.ai',
  skipPermissions: false,
}

export default commandcode
