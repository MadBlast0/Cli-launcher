// Bundles each CLI's logo straight from its registry folder (src/cli-registry/<id>/logo.*)
// Vite emits them as hashed assets and gives us URLs, keyed by CLI id.
const modules = import.meta.glob('../cli-registry/*/logo.{png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const cliLogos: Record<string, string> = {}

for (const [filePath, url] of Object.entries(modules)) {
  const match = filePath.match(/cli-registry\/([^/]+)\/logo\.(?:png|svg)$/)
  if (match) cliLogos[match[1]] = url
}

export function getCliLogo(id: string): string | undefined {
  return cliLogos[id]
}
