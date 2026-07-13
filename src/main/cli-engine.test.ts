import { describe, it, expect, vi } from 'vitest'

// `cli-engine` imports `electron` (and transitively `./settings` does too).
// Stub it so the module can be imported in a plain Node test environment.
vi.mock('electron', () => ({
  app: { getPath: () => '/tmp', isPackaged: false },
}))

import { parseProgressLine, getRepoFromHomepage, needsElevationForCli } from './cli-engine'

describe('parseProgressLine', () => {
  it('parses pip download progress into a percentage', () => {
    const r = parseProgressLine('1.2/2.4 MB 2.1 MB/s eta 0:00:00')
    expect(r.type).toBe('progress')
    expect(r.percent).toBeGreaterThan(0)
    expect(r.percent).toBeLessThanOrEqual(100)
  })

  it('parses an npm fetch line', () => {
    const r = parseProgressLine('npm http fetch GET 200 https://registry.npmjs.org/some-pkg')
    expect(r.message).toContain('fetching')
  })

  it('falls back to a truncated working message for unknown output', () => {
    const r = parseProgressLine('resolving dependencies…')
    expect(r.type).toBe('progress')
    expect(r.message).toContain('resolving dependencies')
  })
})

describe('getRepoFromHomepage', () => {
  it('extracts owner/repo from a github.com URL', () => {
    expect(getRepoFromHomepage('https://github.com/sigoden/aichat')).toBe('sigoden/aichat')
  })

  it('strips a .git suffix', () => {
    expect(getRepoFromHomepage('https://github.com/block/goose.git')).toBe('block/goose')
  })

  it('handles git+https style URLs', () => {
    expect(getRepoFromHomepage('git+https://github.com/charmbracelet/mods.git')).toBe('charmbracelet/mods')
  })

  it('returns null for non-github homepages', () => {
    expect(getRepoFromHomepage('https://cursor.com/cli')).toBeNull()
    expect(getRepoFromHomepage('https://factory.ai')).toBeNull()
    expect(getRepoFromHomepage(undefined)).toBeNull()
  })
})

describe('needsElevationForCli', () => {
  const nodeCli = { id: 'n', name: 'n', executable: 'n', dependencyType: 'node' as const, description: '', skipPermissions: false }
  const pyCli = { id: 'p', name: 'p', executable: 'p', dependencyType: 'python' as const, description: '', skipPermissions: false }
  const standaloneCli = { id: 's', name: 's', executable: 's', dependencyType: 'standalone' as const, description: '', skipPermissions: false }

  it('never elevates on Windows', async () => {
    // These tests run on the CI OS only; os.platform isn't easily stubbed.
    if (process.platform === 'win32') {
      expect(await needsElevationForCli(nodeCli)).toBe(false)
    }
  })

  it('always elevates node/pip on macOS', async () => {
    if (process.platform === 'darwin') {
      expect(await needsElevationForCli(nodeCli)).toBe(true)
      expect(await needsElevationForCli(pyCli)).toBe(true)
    }
  })

  it('never elevates standalone CLIs', async () => {
    expect(await needsElevationForCli(standaloneCli)).toBe(false)
  })

  it('respects the elevateInstalls=false setting', async () => {
    const { writeSettings } = await import('./settings')
    writeSettings({ theme: 'dark', elevateInstalls: false })
    expect(await needsElevationForCli(nodeCli)).toBe(false)
    writeSettings({ theme: 'dark', elevateInstalls: true })
  })
})
