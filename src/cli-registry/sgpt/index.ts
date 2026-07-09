import type { CliDefinition } from '../../shared/types'

const sgpt: CliDefinition = {
  id: 'sgpt',
  name: 'Shell-GPT',
  executable: 'sgpt',
  packageName: 'shell-gpt',
  dependencyType: 'python',
  description: 'ChatGPT-powered shell command and code assistant.',
  homepage: 'https://github.com/TheR1D/shell_gpt',
  skipPermissions: false,
}

export default sgpt
