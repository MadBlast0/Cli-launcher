import type { CliDefinition } from '../../shared/types'

const amazonq: CliDefinition = {
  id: 'amazonq',
  name: 'Amazon Q Developer CLI',
  executable: 'q',
  // No native Windows build — installed and run through WSL. Detection via
  // where.exe will not see the WSL binary, so we use wslExecutable.
  dependencyType: 'standalone',
  description: 'AWS terminal agent (requires WSL on Windows)',
  wslExecutable: true,
  homepage: 'https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html',
  skipPermissions: false,
}

export default amazonq
