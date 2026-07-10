import type { CliDefinition } from '../../shared/types'

const qwen: CliDefinition = {
  id: 'qwen',
  name: 'Qwen Code',
  executable: 'qwen',
  packageName: '@qwen-code/qwen-code',
  dependencyType: 'node',
  description: 'Alibaba\'s Qwen-powered AI coding agent',
  homepage: 'https://github.com/QwenLM/Qwen-Code',
  skipPermissions: false,
}

export default qwen
