import { execFile, spawn, exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { promisify } from 'util'
import { app } from 'electron'
import { CliAction, CliActionResult, CliDefinition } from '../shared/types'

const isWindows = os.platform() === 'win32'
const isMac = os.platform() === 'darwin'
const execFileAsync = promisify(execFile)

async function checkOnPath(exe: string): Promise<boolean> {
  try {
    const cmd = isWindows ? 'where.exe' : 'which'
    await execFileAsync(cmd, [exe])
    return true
  } catch {
    return false
  }
}

const WINDOWS_TERMINALS: { exe: string; value: string; label: string }[] = [
  { exe: 'wt.exe', value: 'wt', label: 'Windows Terminal' },
  { exe: 'pwsh.exe', value: 'pwsh', label: 'PowerShell 7' },
  { exe: 'powershell.exe', value: 'powershell', label: 'Windows PowerShell' },
  { exe: 'alacritty.exe', value: 'alacritty', label: 'Alacritty' },
  { exe: 'wezterm.exe', value: 'wezterm', label: 'WezTerm' },
  { exe: 'hyper.exe', value: 'hyper', label: 'Hyper' },
  { exe: 'tabby.exe', value: 'tabby', label: 'Tabby' },
]

const WINDOWS_TERMINAL_FALLBACK_PATHS: { exe: string; lookup: string; value: string; label: string }[] = [
  {
    exe: 'wt.exe',
    lookup: path.join(process.env['LOCALAPPDATA'] || '', 'Microsoft', 'WindowsApps', 'wt.exe'),
    value: 'wt',
    label: 'Windows Terminal',
  },
  {
    exe: 'wt.exe',
    lookup: path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'WindowsApps', 'wt.exe'),
    value: 'wt',
    label: 'Windows Terminal',
  },
]

const MAC_TERMINALS: { path: string; value: string; label: string }[] = [
  { path: '/Applications/iTerm.app', value: 'iterm', label: 'iTerm2' },
  { path: '/Applications/Warp.app', value: 'warp', label: 'Warp' },
  { path: '/Applications/Alacritty.app', value: 'alacritty', label: 'Alacritty' },
  { path: '/Applications/Hyper.app', value: 'hyper', label: 'Hyper' },
  { path: '/Applications/Kitty.app', value: 'kitty', label: 'Kitty' },
  { path: '/Applications/WezTerm.app', value: 'wezterm', label: 'WezTerm' },
  { path: '/Applications/Tabby.app', value: 'tabby', label: 'Tabby' },
]

const LINUX_TERMINALS: { exe: string; value: string; label: string }[] = [
  { exe: 'x-terminal-emulator', value: 'x-terminal-emulator', label: 'X Terminal' },
  { exe: 'gnome-terminal', value: 'gnome-terminal', label: 'GNOME Terminal' },
  { exe: 'konsole', value: 'konsole', label: 'Konsole' },
  { exe: 'xterm', value: 'xterm', label: 'XTerm' },
  { exe: 'alacritty', value: 'alacritty', label: 'Alacritty' },
  { exe: 'kitty', value: 'kitty', label: 'Kitty' },
  { exe: 'tilix', value: 'tilix', label: 'Tilix' },
  { exe: 'terminator', value: 'terminator', label: 'Terminator' },
  { exe: 'wezterm', value: 'wezterm', label: 'WezTerm' },
  { exe: 'hyper', value: 'hyper', label: 'Hyper' },
]

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
    if (process.env.WT_SESSION) return 'wt'
    for (const t of WINDOWS_TERMINALS) {
      if (t.value === 'wt' && fs.existsSync(
        path.join(process.env['LOCALAPPDATA'] || '', 'Microsoft', 'WindowsApps', 'wt.exe')
      )) return 'wt'
    }
    return 'cmd'
  }
  if (isMac) {
    for (const t of MAC_TERMINALS) {
      if (fs.existsSync(t.path)) return t.value
    }
    return 'terminal'
  }
  for (const t of LINUX_TERMINALS) {
    if (fs.existsSync(`/usr/bin/${t.exe}`) || fs.existsSync(`/usr/local/bin/${t.exe}`)) return t.value
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
      if (cli.wslExecutable) {
        const wslDir = folder ? `cd '${folder.replace(/\\/g, '/')}' && ` : ''
        const wslCmd = `${wslDir}${exeCmd}`

        if (terminal === 'wt') {
          spawn('wt.exe', ['-d', folder || process.env.USERPROFILE || '', 'wsl', '-e', 'bash', '-lc', wslCmd], { detached: true, stdio: 'ignore' }).unref()
        } else if (terminal === 'pwsh') {
          spawn('pwsh.exe', ['-NoExit', '-Command', `wsl -e bash -lc "${wslCmd.replace(/"/g, '\\"')}"`], { cwd: folder || undefined, detached: true, stdio: 'ignore' }).unref()
        } else {
          spawn('cmd.exe', ['/c', 'start', '', 'wsl', '-e', 'bash', '-lc', wslCmd], { detached: true, stdio: 'ignore', windowsHide: false }).unref()
        }
      } else {
        const inner = folder
          ? `Set-Location -LiteralPath "${folder}"; ${exeCmd}`
          : exeCmd

        if (terminal === 'wt') {
          spawn('wt.exe', ['-d', folder || process.env.USERPROFILE || '', 'powershell', '-NoExit', '-Command', inner], { detached: true, stdio: 'ignore' }).unref()
        } else if (terminal === 'pwsh') {
          spawn('pwsh.exe', ['-NoExit', '-Command', inner], { cwd: folder || undefined, detached: true, stdio: 'ignore' }).unref()
        } else {
          spawn('cmd.exe', ['/c', 'start', '', 'powershell', '-NoExit', '-Command', inner], { detached: true, stdio: 'ignore', windowsHide: false }).unref()
        }
      }
    } else if (isMac) {
      const inner = folder ? `cd "${folder}" && ${exeCmd}` : exeCmd
      if (terminal === 'iterm') {
        const script = `tell application "iTerm" to create window with default profile command "${inner.replace(/"/g, '\\"')}"`
        spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref()
      } else if (terminal === 'warp') {
        spawn('open', ['-a', 'Warp', inner], { detached: true, stdio: 'ignore' }).unref()
      } else if (terminal === 'alacritty') {
        spawn('/Applications/Alacritty.app/Contents/MacOS/alacritty', ['-e', 'bash', '-c', inner], { detached: true, stdio: 'ignore' }).unref()
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
      const cmd = cli.wslExecutable && isWindows
        ? `wsl -e bash -lc "${cli.executable} --version"`
        : `${cli.executable} --version`
      exec(cmd, { timeout: 5000 }, (_err, stdout) => {
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

export async function detectAvailableTerminals(): Promise<{ value: string; label: string }[]> {
  const terminals: { value: string; label: string }[] = [{ value: '', label: 'Auto' }]
  const seen = new Set<string>()

  if (isWindows) {
    terminals.push({ value: 'cmd', label: 'CMD' })
    seen.add('cmd')

    for (const t of WINDOWS_TERMINALS) {
      if (seen.has(t.value)) continue
      if (await checkOnPath(t.exe)) {
        terminals.push({ value: t.value, label: t.label })
        seen.add(t.value)
      }
    }

    for (const t of WINDOWS_TERMINAL_FALLBACK_PATHS) {
      if (seen.has(t.value)) continue
      if (fs.existsSync(t.lookup)) {
        terminals.push({ value: t.value, label: t.label })
        seen.add(t.value)
      }
    }
  } else if (isMac) {
    terminals.push({ value: 'terminal', label: 'Terminal.app' })
    seen.add('terminal')

    for (const t of MAC_TERMINALS) {
      if (seen.has(t.value)) continue
      if (fs.existsSync(t.path)) {
        terminals.push({ value: t.value, label: t.label })
        seen.add(t.value)
      }
    }

    for (const t of MAC_TERMINALS) {
      if (seen.has(t.value)) continue
      if (await checkOnPath(t.value)) {
        terminals.push({ value: t.value, label: t.label })
        seen.add(t.value)
      }
    }
  } else {
    for (const t of LINUX_TERMINALS) {
      if (seen.has(t.value)) continue
      if (await checkOnPath(t.exe) ||
          fs.existsSync(`/usr/bin/${t.exe}`) ||
          fs.existsSync(`/usr/local/bin/${t.exe}`)) {
        terminals.push({ value: t.value, label: t.label })
        seen.add(t.value)
      }
    }
  }
  return terminals
}

export { isWindows }
