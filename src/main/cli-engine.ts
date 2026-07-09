import { execFile, spawn, exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { app } from 'electron'
import { CliAction, CliActionResult, CliDefinition } from '../shared/types'

const isWindows = os.platform() === 'win32'
const isMac = os.platform() === 'darwin'

function getAppRoot(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked')
  }
  return path.join(__dirname, '../..')
}

function getScriptPath(cliId: string, action: CliAction): string {
  const baseDir = path.join(getAppRoot(), 'src/cli-registry', cliId)
  const ext = isWindows ? '.ps1' : '.sh'
  const scriptPath = path.join(baseDir, `${action}${ext}`)

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`)
  }
  return scriptPath
}

function runScript(scriptPath: string): Promise<CliActionResult> {
  return new Promise((resolve) => {
    const cmd = isWindows ? 'powershell' : 'bash'
    const args = isWindows
      ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath]
      : [scriptPath]

    const child = execFile(cmd, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout, error: stderr || error.message })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
    child.stdin?.end()
  })
}

function detectTerminalEmulator(): string {
  if (isWindows) {
    const wt = process.env.WT_SESSION ? 'wt' : null
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files'
    const wtPath = path.join(programFiles, 'WindowsApps', 'wt.exe')
    if (wt || fs.existsSync(wtPath)) return 'wt'
    return 'cmd'
  }
  if (isMac) {
    const iterm = '/Applications/iTerm.app/Contents/MacOS/iTerm2'
    if (fs.existsSync(iterm)) return 'iterm'
    return 'terminal'
  }
  const terminals = ['x-terminal-emulator', 'gnome-terminal', 'konsole', 'xterm']
  for (const t of terminals) {
    if (fs.existsSync(`/usr/bin/${t}`)) return t
  }
  return 'xterm'
}

export function openCli(cli: CliDefinition, folder: string | null, terminalOverride?: string): CliActionResult {
  const flag = cli.skipPermissions
    ? ` ${cli.skipPermissionsFlag || '--dangerously-skip-permissions'}`
    : ''
  const exeCmd = `${cli.executable}${flag}`

  try {
    const terminal = terminalOverride || detectTerminalEmulator()

    if (isWindows) {
      const inner = folder
        ? `Set-Location -LiteralPath "${folder}"; ${exeCmd}`
        : exeCmd

      if (terminal === 'wt') {
        spawn('wt.exe', ['-d', folder || process.env.USERPROFILE || '', 'powershell', '-NoExit', '-Command', inner], { detached: true, stdio: 'ignore' }).unref()
      } else {
        spawn('cmd.exe', ['/c', 'start', '', 'powershell', '-NoExit', '-Command', inner], { detached: true, stdio: 'ignore', windowsHide: false }).unref()
      }
    } else if (isMac) {
      const inner = folder ? `cd "${folder}" && ${exeCmd}` : exeCmd
      if (terminal === 'iterm') {
        const script = `tell application "iTerm" to create window with default profile command "${inner.replace(/"/g, '\\"')}"`
        spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref()
      } else {
        const script = `tell application "Terminal" to do script "${inner.replace(/"/g, '\\"')}"`
        spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref()
      }
    } else {
      const inner = folder ? `cd "${folder}" && ${exeCmd}` : exeCmd
      spawn(terminal, ['-e', `bash -c "${inner}; exec bash"`], { detached: true, stdio: 'ignore' }).unref()
    }
    return { success: true, output: `Opened ${cli.name} in ${terminal}` }
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'Failed to open terminal',
    }
  }
}

const CACHE_TTL = 60 * 60 * 1000

const npmOutdatedCache: { data: Record<string, { current: string; latest: string }> | null; ts: number } = { data: null, ts: 0 }
const pipOutdatedCache: { data: Record<string, { current: string; latest: string }> | null; ts: number } = { data: null, ts: 0 }

function isCacheFresh(cache: { ts: number }): boolean {
  return Date.now() - cache.ts < CACHE_TTL
}

function getNpmOutdated(): Promise<Record<string, { current: string; latest: string }>> {
  if (npmOutdatedCache.data && isCacheFresh(npmOutdatedCache)) {
    return Promise.resolve(npmOutdatedCache.data!)
  }
  return new Promise((resolve) => {
    execFile(
      'npm',
      ['outdated', '-g', '--json'],
      { timeout: 25000, maxBuffer: 1024 * 1024 },
      (_error: unknown, stdout: string) => {
        try {
          const data: Record<string, { current: string; latest: string }> = JSON.parse(stdout || '{}')
          npmOutdatedCache.data = data
          npmOutdatedCache.ts = Date.now()
          resolve(data)
        } catch {
          resolve({})
        }
      }
    )
  })
}

function getPipOutdated(): Promise<Record<string, { current: string; latest: string }>> {
  if (pipOutdatedCache.data && isCacheFresh(pipOutdatedCache)) {
    return Promise.resolve(pipOutdatedCache.data!)
  }
  return new Promise((resolve) => {
    execFile(
      'pip',
      ['list', '--outdated', '--format=json'],
      { timeout: 25000, maxBuffer: 1024 * 1024 },
      (_error: unknown, stdout: string) => {
        try {
          const list = JSON.parse(stdout || '[]')
          const map: Record<string, { current: string; latest: string }> = {}
          for (const pkg of list) {
            map[pkg.name] = { current: pkg.version, latest: pkg.latest_version }
          }
          pipOutdatedCache.data = map
          pipOutdatedCache.ts = Date.now()
          resolve(map)
        } catch {
          resolve({})
        }
      }
    )
  })
}

export async function checkCliUpdate(
  cli: CliDefinition
): Promise<{ updateAvailable: boolean; latestVersion?: string }> {
  if (cli.dependencyType === 'node' && cli.packageName) {
    const outdated = await getNpmOutdated()
    const entry = outdated[cli.packageName]
    if (entry && entry.current && entry.latest && entry.current !== entry.latest) {
      return { updateAvailable: true, latestVersion: entry.latest }
    }
    return { updateAvailable: false }
  }

  if (cli.dependencyType === 'python' && cli.packageName) {
    const outdated = await getPipOutdated()
    const entry = outdated[cli.packageName]
    if (entry && entry.current && entry.latest && entry.current !== entry.latest) {
      return { updateAvailable: true, latestVersion: entry.latest }
    }
    return { updateAvailable: false }
  }

  return { updateAvailable: false }
}

const standaloneVersionCache: { data: Record<string, string>; ts: number } = { data: {}, ts: 0 }

export async function checkStandaloneUpdate(
  cli: CliDefinition
): Promise<{ updateAvailable: boolean; latestVersion?: string }> {
  if (!isCacheFresh(standaloneVersionCache)) {
    standaloneVersionCache.data = {}
    standaloneVersionCache.ts = Date.now()
    try {
      const npmView = await new Promise<string>((resolve) => {
        exec(`npm view ${cli.packageName || cli.id} version`, { timeout: 10000 }, (_err, stdout) => {
          resolve(stdout.trim())
        })
      })
      if (npmView) standaloneVersionCache.data[cli.id] = npmView
    } catch { /* not an npm package */ }
  }

  const latest = standaloneVersionCache.data[cli.id]
  if (!latest) return { updateAvailable: false }

  try {
    const current = await new Promise<string>((resolve) => {
      exec(`${cli.executable} --version`, { timeout: 5000 }, (_err, stdout) => {
        resolve(stdout.trim().split('\n')[0] || '')
      })
    })
    if (current && current !== latest) {
      return { updateAvailable: true, latestVersion: latest }
    }
  } catch { /* ignore */ }

  return { updateAvailable: false }
}

export async function executeCliAction(cliId: string, action: CliAction): Promise<CliActionResult> {
  try {
    const scriptPath = getScriptPath(cliId, action)
    return await runScript(scriptPath)
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export { isWindows }
