import type { CliDefinition } from '../../shared/types'

const grok: CliDefinition = {
  id: 'grok',
  name: 'Grok CLI',
  executable: 'grok',
  packageName: '@vibe-kit/grok-cli',
  dependencyType: 'node',
  description: 'xAI Grok-powered terminal coding agent.',
  homepage: 'https://x.ai',
  skipPermissions: true,
  skipPermissionsFlag: '--always-approve',
}

export default grok
