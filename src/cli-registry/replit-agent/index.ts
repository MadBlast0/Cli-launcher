import type { CliDefinition } from '../../shared/types'

const replitAgent: CliDefinition = {
  id: 'replit-agent',
  name: 'Replit Agent',
  executable: 'replit-agent',
  packageName: 'replit-agent',
  dependencyType: 'node',
  description: 'Replit\'s AI coding agent that runs in your terminal',
  homepage: 'https://replit.com/agent',
  skipPermissions: false,
}

export default replitAgent
