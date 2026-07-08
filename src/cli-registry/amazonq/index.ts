import type { CliDefinition } from '../../shared/types'

const amazonq: CliDefinition = {
  id: 'amazonq',
  name: 'Amazon Q Developer CLI',
  executable: 'q',
  // No native Windows build — installed and run through WSL. Detection via
  // where.exe will not see the WSL binary, so it stays in the catalog.
  dependencyType: 'standalone',
  description: 'AWS terminal agent (requires WSL on Windows)',
  homepage: 'https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html',
  skipPermissions: false,
}

export default amazonq
