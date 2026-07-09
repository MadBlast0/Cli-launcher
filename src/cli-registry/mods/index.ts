import type { CliDefinition } from '../../shared/types'

const mods: CliDefinition = {
  id: 'mods',
  name: 'Mods',
  executable: 'mods',
  dependencyType: 'standalone',
  description: 'AI on the command line, pipe-friendly, by Charm.',
  homepage: 'https://github.com/charmbracelet/mods',
  skipPermissions: false,
}

export default mods
