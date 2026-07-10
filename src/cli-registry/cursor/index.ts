import type { CliDefinition } from '../../shared/types'

const cursor: CliDefinition = {
  id: 'cursor',
  name: 'Cursor CLI',
  executable: 'agent',
  // Not an npm package — installed via Cursor's native Windows PowerShell script.
  dependencyType: 'standalone',
  description: 'Run Cursor\'s coding agent in the terminal',
  homepage: 'https://cursor.com/cli',
  skipPermissions: false,
}

export default cursor
