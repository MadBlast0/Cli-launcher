import { execFile, spawn, execSync, exec, ChildProcess } from 'child_process'
import type { ActionProgressMessage } from '../shared/types'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { app } from 'electron'
import { CliAction, CliActionResult, CliDefinition, CliLaunchResult, LaunchErrorCode } from '../shared/types'
import { qPS, qSH, qCMD, buildPSCommand, buildWSLCommand } from './terminal-serializers'
import { getConfiguredTerminal as settingsGetConfiguredTerminal } from './settings'

const isWindows = os.platform() === 'win32'
const isMac = os.platform() === 'darwin'

// Bounded, generous timeout for scripted actions. Long `npm install -g` /
// runtime downloads can legitimately exceed 5 minutes, so we avoid the old
// 300s kill that mislabeled timeouts as "Cancelled". 30 minutes is a ceiling
// against true hangs, not a normal-case limit.
const ACTION_TIMEOUT = 30 * 60 * 1000

// Tracks user-requested cancellations so a killed process can be distinguished
// from a (rare) timeout kill in `runScript`'s close handler.
const cancelledActions = new Set<string>()

// Resolves the pip invocation to use. Many Linux/macOS systems only ship
// `pip3` (or `python3 -m pip`), so a bare `pip` call silently fails and every
// Python CLI is reported as not-installed. We probe and memoize the first
// available variant.
let pipRunner: { exe: string; prefix: string[] } | null = null
async function resolvePip(): Promise<{ exe: string; prefix: string[] }> {
  if (pipRunner) return pipRunner
  const candidates: { exe: string; prefix: string[] }[] = [
    { exe: 'pip3', prefix: [] },
    { exe: 'pip', prefix: [] },
    { exe: 'python3', prefix: ['-m', 'pip'] },
    { exe: 'python', prefix: ['-m', 'pip'] },
  ]
  for (const c of candidates) {
    const ok = await new Promise<boolean>((resolve) => {
      execFile(c.exe, [...c.prefix, '--version'], { timeout: 5000 }, (err) => resolve(!err))
    })
    if (ok) {
      pipRunner = c
      return c
    }
  }
  // Fall back to `pip3`; the caller's exec will error and we degrade gracefully.
  pipRunner = { exe: 'pip3', prefix: [] }
  return pipRunner
}

// Platform default terminals (always available on each OS)
const MAC_DEFAULT = 'terminal'
const LINUX_DEFAULT = 'x-terminal-emulator'

async function detectWindowsTerminal(): Promise<string> {
  // Prefer Windows Terminal when it's present (nicer tabs/UX); otherwise fall
  // back to a classic PowerShell window, which always exists.
  if (await commandExistsAsync('wt')) return 'wt'
  return 'powershell'
}

// ---------------------------------------------------------------------------
// Escaping helpers
// ---------------------------------------------------------------------------

function getAppRoot(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked')
  }
  return path.join(__dirname, '../..')
}

function getScriptPath(cliId: string, action: CliAction): string {
  // Defense-in-depth: even though callers resolve `cliId` against the registry,
  // never let an unexpected id escape `src/cli-registry` via path traversal.
  if (!/^[a-z0-9-]+$/.test(cliId)) {
    throw new Error(`Invalid CLI id: ${cliId}`)
  }
  const baseDir = path.join(getAppRoot(), 'src/cli-registry', cliId)
  const ext = isWindows ? '.ps1' : '.sh'
  const scriptPath = path.join(baseDir, `${action}${ext}`)

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`)
  }
  return scriptPath
}

const runningProcesses = new Map<string, ChildProcess>()

/** Kills a child and, on POSIX, its whole process group (spawned detached). */
function killProcessTree(child: ChildProcess) {
  try {
    if (!isWindows && child.pid) {
      process.kill(-child.pid, 'SIGTERM')
    } else {
      child.kill('SIGTERM')
    }
  } catch { /* already exited */ }
}

export function cancelAction(cliId: string): boolean {
  const child = runningProcesses.get(cliId)
  if (!child) return false
  cancelledActions.add(cliId)
  killProcessTree(child)
  runningProcesses.delete(cliId)
  return true
}

export function parseProgressLine(line: string): ActionProgressMessage {
  const lower = line.toLowerCase().trim()

  // pip download progress: "1.2/1.2 MB 2.1 MB/s eta 0:00:00"
  const pipMatch = lower.match(/(\d+\.?\d*)\/(\d+\.?\d*)\s*(kb|mb|gb)/)
  if (pipMatch) {
    const current = parseFloat(pipMatch[1])
    const total = parseFloat(pipMatch[2])
    const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : undefined
    return { type: 'progress', percent, message: line.trim().substring(0, 100) }
  }

  // npm fetch lines: "npm http fetch GET 200 https://.../package-name"
  if (lower.includes('fetch') || lower.includes('http get') || lower.includes('http post')) {
    const match = line.match(/\/package\/[^/]+\/([^\s@]+)/) || line.match(/\/([^/\s]+?)(?:@[\d.]+)?\s/)
    const pkg = match ? match[1].trim() : ''
    return { type: 'progress', message: pkg ? `fetching ${pkg}…` : 'fetching…' }
  }

  if (lower.startsWith('collecting ')) {
    return { type: 'progress', message: line.trim().substring(0, 100) }
  }
  if (lower.startsWith('installing collected')) {
    return { type: 'progress', message: 'installing…' }
  }
  if (lower.startsWith('successfully installed')) {
    const pkgs = line.replace(/^Successfully installed /i, '').trim()
    return { type: 'progress', percent: 100, message: `installed ${pkgs}` }
  }

  if (line.trim()) {
    return { type: 'progress', message: line.trim().substring(0, 100) }
  }
  return { type: 'progress', message: 'working…' }
}

function runScript(scriptPath: string, cliId?: string, onProgress?: (msg: ActionProgressMessage) => void): Promise<CliActionResult> {
  return new Promise((resolve) => {
    const cmd = isWindows ? 'powershell' : 'bash'
    const args = isWindows
      ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath]
      : [scriptPath]

    // `detached` makes the child its own process-group leader (POSIX) so a
    // cancel can kill the whole tree (npm → node installer). On Windows we keep
    // it attached: `detached: true` there allocates a fresh console window and
    // would flash a visible terminal during every install/update.
    const child = spawn(cmd, args, { timeout: ACTION_TIMEOUT, detached: !isWindows })
    if (cliId) runningProcesses.set(cliId, child)
    let stdout = ''
    let killed = false
    // Buffers that arrive mid-line across `data` chunks must be reassembled;
    // otherwise a progress line split on a chunk boundary is dropped/garbled.
    let stdoutRemainder = ''
    let stderrRemainder = ''

    const emit = (line: string) => {
      if (onProgress && !killed && line) onProgress(parseProgressLine(line))
    }

    child.stdout?.on('data', (chunk: Buffer) => {
      const text = stdoutRemainder + chunk.toString()
      stdoutRemainder = ''
      stdout += chunk.toString()
      const parts = text.split('\n')
      // The final element is an incomplete line (no trailing newline yet).
      for (let i = 0; i < parts.length - 1; i++) emit(parts[i])
      if (text.endsWith('\n')) emit(parts[parts.length - 1])
      else stdoutRemainder = parts[parts.length - 1]
    })

    let stderr = ''
    child.stderr?.on('data', (chunk: Buffer) => {
      const text = stderrRemainder + chunk.toString()
      stderrRemainder = ''
      stderr += chunk.toString()
      // npm writes progress to stderr
      const parts = text.split('\n')
      for (let i = 0; i < parts.length - 1; i++) emit(parts[i])
      if (text.endsWith('\n')) emit(parts[parts.length - 1])
      else stderrRemainder = parts[parts.length - 1]
    })

    child.on('close', (code, signal) => {
      if (cliId) {
        runningProcesses.delete(cliId)
        cancelledActions.delete(cliId)
      }
      killed = true
      if (signal) {
        // Distinguish a user cancel from a (rare) timeout kill.
        const wasCancelled = cliId ? cancelledActions.has(cliId) : false
        resolve({ success: false, output: stdout, error: wasCancelled ? 'Cancelled' : 'Process terminated' })
      } else if (code !== 0) {
        resolve({ success: false, output: stdout, error: stderr || `Exit code ${code}` })
      } else {
        resolve({ success: true, output: stdout })
      }
    })

    child.on('error', (err) => {
      if (cliId) {
        runningProcesses.delete(cliId)
        cancelledActions.delete(cliId)
      }
      resolve({ success: false, output: stdout, error: err.message })
    })
  })
}

async function detectTerminalEmulator(): Promise<string> {
  if (isWindows) return detectWindowsTerminal()
  if (isMac) return MAC_DEFAULT
  return LINUX_DEFAULT
}

/** Reads the user's preferred terminal emulator from saved settings, if any. */
function getConfiguredTerminal(): string | null {
  return settingsGetConfiguredTerminal()
}

/** Best-effort check for an executable on the system PATH (Windows). */
function commandExists(cmd: string): boolean {
  try {
    execSync(`where ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Async equivalents used on the launch/detection hot path so they never block
// the Electron main (UI) thread while shelling out to `where`/`which`.
function pathLookupAsync(exe: string): Promise<boolean> {
  return new Promise((resolve) => {
    const detector = isWindows ? 'where' : 'which'
    execFile(detector, [exe], { timeout: 5000 }, (err) => resolve(!err))
  })
}

const commandExistsAsync = (cmd: string): Promise<boolean> => pathLookupAsync(cmd)
const nativeExecutablePresentAsync = (exe: string): Promise<boolean> => pathLookupAsync(exe)

// ---------------------------------------------------------------------------
// Terminal launcher registry
//
// Each launcher receives the CLI executable and its arguments as separate
// tokens and is responsible for serializing them according to its parser
// boundary.  No launcher receives a pre-joined command string.
// ---------------------------------------------------------------------------

/** Wrapper around spawn that logs async errors (ENOENT etc.) instead of losing them. */
function spawnSafe(exe: string, args: string[], opts: import('child_process').SpawnOptions = {}): ChildProcess {
  const child: ChildProcess = spawn(exe, args, opts as any)
  child.on('error', (err: Error) => {
    console.error(`[cli-engine] spawn failed: ${exe} ${args.join(' ')} — ${err.message}`)
  })
  return child
}

type LauncherFn = (
  executable: string,
  args: string[],
  folder: string | null,
) => ChildProcess

/** Shared Windows launcher: opens a new PowerShell window that runs the CLI. */
function launchViaPowershellStart(exe: string, args: string[], folder: string | null): ChildProcess {
  const psCmd = buildPSCommand(exe, args, folder)
  return spawnSafe('cmd.exe', ['/c', 'start', '""', 'powershell', '-NoExit', '-Command', qCMD(psCmd)], { detached: true, stdio: 'ignore', windowsHide: false })
}

const WINDOWS_LAUNCHERS: Record<string, LauncherFn> = {
  cmd: (exe, args, folder) => {
    // cmd.exe /k receives a command string; args are from trusted registry so
    // minimal quoting is needed here, but we still wrap each in double-quotes
    // to protect spaces.
    const cmdStr = `${qCMD(exe)} ${args.map(a => qCMD(a)).join(' ')}`
    return spawnSafe('cmd.exe', ['/k', cmdStr], { cwd: folder || undefined, detached: true, stdio: 'ignore', windowsHide: false })
  },
  powershell: (exe, args, folder) => launchViaPowershellStart(exe, args, folder),
  wt: (exe, args, folder) => {
    // Windows Terminal uses `&` as a command separator in its own argument
    // parser, so the `& 'exe'` PowerShell call operator in buildPSCommand
    // would be misinterpreted (opening a spurious empty tab + failing to
    // launch the CLI).  Use `cmd /k` instead — this avoids the separator
    // issue AND runs the CLI directly via cmd.exe's PATHEXT resolution
    // (handles .cmd / .exe shims correctly on Windows).
    const all = folder
      ? ['-d', folder, 'cmd', '/k', exe, ...args]
      : ['cmd', '/k', exe, ...args]
    return spawnSafe('wt.exe', all, { detached: true, stdio: 'ignore', windowsHide: false })
  },
  pwsh: (exe, args, folder) => {
    const psCmd = buildPSCommand(exe, args, folder)
    return spawnSafe('cmd.exe', ['/c', 'start', '""', 'pwsh', '-NoExit', '-Command', qCMD(psCmd)], { detached: true, stdio: 'ignore', windowsHide: false })
  },
  alacritty: (exe, args, folder) => {
    // Alacritty -e receives the command; we pass the tokens directly (no shell).
    const all = folder ? ['--working-directory', folder, '-e', 'powershell', '-NoExit', '-Command', buildPSCommand(exe, args, folder)] : ['-e', 'powershell', '-NoExit', '-Command', buildPSCommand(exe, args, folder)]
    return spawnSafe('alacritty.exe', all, { detached: true, stdio: 'ignore' })
  },
  wezterm: (exe, args, folder) => {
    const psCmd = buildPSCommand(exe, args, folder)
    const all = folder
      ? ['start', '--cwd', folder, '--', 'powershell', '-NoExit', '-Command', psCmd]
      : ['start', '--', 'powershell', '-NoExit', '-Command', psCmd]
    return spawnSafe('wezterm.exe', all, { detached: true, stdio: 'ignore' })
  },
  hyper: (exe, args, folder) =>
    commandExists('hyper')
      ? spawnSafe('cmd.exe', ['/c', 'start', '""', 'hyper'], { detached: true, stdio: 'ignore', windowsHide: false })
      : launchViaPowershellStart(exe, args, folder),
  tabby: (exe, args, folder) =>
    commandExists('tabby')
      ? spawnSafe('cmd.exe', ['/c', 'start', '""', 'tabby'], { detached: true, stdio: 'ignore', windowsHide: false })
      : launchViaPowershellStart(exe, args, folder),
}

const WINDOWS_WSL_LAUNCHERS: Record<string, LauncherFn> = {
  cmd: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    const c = `wsl -e bash -lc ${qCMD(shCmd)}`
    return spawnSafe('cmd.exe', ['/k', c], { cwd: folder || undefined, detached: true, stdio: 'ignore', windowsHide: false })
  },
  powershell: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    return spawnSafe('powershell.exe', ['-NoExit', '-Command', `wsl -e bash -lc ${qPS(shCmd)}`], { cwd: folder || undefined, detached: true, stdio: 'ignore', windowsHide: false })
  },
  wt: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    const all = folder
      ? ['-d', folder, 'wsl', '-e', 'bash', '-lc', shCmd]
      : ['wsl', '-e', 'bash', '-lc', shCmd]
    return spawnSafe('wt.exe', all, { detached: true, stdio: 'ignore', windowsHide: false })
  },
  pwsh: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    return spawnSafe('pwsh.exe', ['-NoExit', '-Command', `wsl -e bash -lc ${qPS(shCmd)}`], { cwd: folder || undefined, detached: true, stdio: 'ignore', windowsHide: false })
  },
  alacritty: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    const all = folder
      ? ['--working-directory', folder, '-e', 'wsl', '-e', 'bash', '-lc', shCmd]
      : ['-e', 'wsl', '-e', 'bash', '-lc', shCmd]
    return spawnSafe('alacritty.exe', all, { detached: true, stdio: 'ignore' })
  },
  wezterm: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    const all = folder
      ? ['start', '--cwd', folder, '--', 'wsl', '-e', 'bash', '-lc', shCmd]
      : ['start', '--', 'wsl', '-e', 'bash', '-lc', shCmd]
    return spawnSafe('wezterm.exe', all, { detached: true, stdio: 'ignore' })
  },
  hyper: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    return spawnSafe('cmd.exe', ['/c', 'start', '""', 'wsl', '-e', 'bash', '-lc', shCmd], { detached: true, stdio: 'ignore', windowsHide: false })
  },
  tabby: (exe, args, folder) => {
    const shCmd = buildWSLCommand(exe, args, folder)
    return spawnSafe('cmd.exe', ['/c', 'start', '""', 'wsl', '-e', 'bash', '-lc', shCmd], { detached: true, stdio: 'ignore', windowsHide: false })
  },
}

// Static AppleScript that receives values through `osascript` arguments.
// Each value is safely quoted via AppleScript's `quoted form of`.
const MAC_TERMINAL_SCRIPT = `
on run argv
  set cwd to item 1 of argv
  set cmdTokens to items 2 thru -1 of argv
  set cmd to ""
  repeat with t in cmdTokens
    set cmd to cmd & " " & quoted form of t
  end repeat
  tell application "Terminal"
    do script "cd " & quoted form of cwd & " && exec" & cmd
    activate
  end tell
end run
`.trim()

const MAC_ITERM_SCRIPT = `
on run argv
  set cwd to item 1 of argv
  set cmdTokens to items 2 thru -1 of argv
  set cmd to ""
  repeat with t in cmdTokens
    set cmd to cmd & " " & quoted form of t
  end repeat
  tell application "iTerm"
    create window with default profile command "cd " & quoted form of cwd & " && exec" & cmd
  end tell
end run
`.trim()

const MAC_LAUNCHERS: Record<string, LauncherFn> = {
  terminal: (exe, args, folder) => {
    return spawnSafe('osascript', ['-e', MAC_TERMINAL_SCRIPT, '--', folder || '', exe, ...args], { detached: true, stdio: 'ignore' })
  },
  iterm: (exe, args, folder) => {
    return spawnSafe('osascript', ['-e', MAC_ITERM_SCRIPT, '--', folder || '', exe, ...args], { detached: true, stdio: 'ignore' })
  },
  warp: (exe, args, folder) => {
    // Warp does not execute an arbitrary command passed via `open -a Warp
    // --args`, so routing through it would open Warp without running the CLI.
    // Fall back to the standard Terminal launcher, which reliably runs the
    // command. (Selecting "Warp" still launches the CLI; it just isn't inside
    // a Warp window until Warp gains command-line launch support.)
    return MAC_LAUNCHERS['_fallback'](exe, args, folder)
  },
  alacritty: (exe, args, folder) => {
    // Alacritty on macOS runs bash -c; use POSIX quoting.
    const tokens = [exe, ...args].map(qSH).join(' ')
    const inner = folder ? `cd ${qSH(folder)} && ${tokens}` : tokens
    return spawnSafe('/Applications/Alacritty.app/Contents/MacOS/alacritty', ['-e', 'bash', '-c', inner], { detached: true, stdio: 'ignore' })
  },
  _fallback: (exe, args, folder) => {
    return spawnSafe('osascript', ['-e', MAC_TERMINAL_SCRIPT, '--', folder || '', exe, ...args], { detached: true, stdio: 'ignore' })
  },
}

const LINUX_LAUNCHERS: Record<string, LauncherFn> = {
  'x-terminal-emulator': (exe, args, folder) => {
    // Generic `-e` flag; fallback uses bash -c with POSIX quoting.
    const tokens = [exe, ...args].map(qSH).join(' ')
    const inner = folder ? `cd ${qSH(folder)} && exec ${tokens}` : `exec ${tokens}`
    return spawnSafe('x-terminal-emulator', ['-e', 'sh', '-c', inner], { cwd: folder || undefined, detached: true, stdio: 'ignore' })
  },
  'gnome-terminal': (exe, args, folder) => {
    // gnome-terminal supports --working-directory and -- separator.
    const all = folder
      ? ['--working-directory', folder, '--', exe, ...args]
      : ['--', exe, ...args]
    return spawnSafe('gnome-terminal', all, { detached: true, stdio: 'ignore' })
  },
  konsole: (exe, args, folder) => {
    const all = folder
      ? ['--workdir', folder, '-e', exe, ...args]
      : ['-e', exe, ...args]
    return spawnSafe('konsole', all, { detached: true, stdio: 'ignore' })
  },
  'xfce4-terminal': (exe, args, folder) => {
    // Use `-x` (execute) which treats the remaining argv as the command to run,
    // so we pass `sh -c <inner>` as separate tokens and avoid re-wrapping the
    // already-POSIX-quoted command inside a second layer of double quotes.
    const tokens = [exe, ...args].map(qSH).join(' ')
    const inner = folder ? `cd ${qSH(folder)} && ${tokens}` : tokens
    return spawnSafe('xfce4-terminal', ['-x', 'sh', '-c', inner], { cwd: folder || undefined, detached: true, stdio: 'ignore' })
  },
  xterm: (exe, args, folder) => {
    return spawnSafe('xterm', ['-e', exe, ...args], { cwd: folder || undefined, detached: true, stdio: 'ignore' })
  },
  _fallback: (exe, args, folder) => {
    const tokens = [exe, ...args].map(qSH).join(' ')
    const inner = folder ? `cd ${qSH(folder)} && exec ${tokens}` : `exec ${tokens}`
    return spawnSafe('x-terminal-emulator', ['-e', 'sh', '-c', inner], { cwd: folder || undefined, detached: true, stdio: 'ignore' })
  },
}

// Linux detection order — first available adapter wins
const LINUX_ADAPTER_ORDER = [
  'x-terminal-emulator',
  'gnome-terminal',
  'konsole',
  'xfce4-terminal',
  'xterm',
]

function getWindowsLauncher(terminal: string, isWsl: boolean): LauncherFn {
  const map = isWsl ? WINDOWS_WSL_LAUNCHERS : WINDOWS_LAUNCHERS
  // Unknown terminals fall back to a plain PowerShell window (always present),
  // never to an arbitrary adapter.
  return map[terminal] || map['powershell'] || WINDOWS_LAUNCHERS['powershell']
}

async function getLinuxLauncher(configured?: string | null): Promise<LauncherFn> {
  if (configured && LINUX_LAUNCHERS[configured]) {
    return LINUX_LAUNCHERS[configured]
  }
  for (const id of LINUX_ADAPTER_ORDER) {
    if (await commandExistsAsync(id)) return LINUX_LAUNCHERS[id]
  }
  return LINUX_LAUNCHERS['_fallback']
}

function makeError(code: LaunchErrorCode, message: string): CliLaunchResult {
  return { success: false, output: '', error: message, errorCode: code }
}

export async function openCli(cli: CliDefinition, folder: string | null, permissionMode?: 'normal' | 'dangerous'): Promise<CliLaunchResult> {
  // --- validation ---
  if (!cli) {
    return makeError('UNKNOWN_CLI', 'The selected CLI does not exist.')
  }

  if (folder) {
    try {
      const stat = fs.statSync(folder)
      if (!stat.isDirectory()) {
        return makeError('INVALID_WORKING_DIRECTORY', 'The selected path is not a directory.')
      }
    } catch {
      return makeError('INVALID_WORKING_DIRECTORY', 'The selected directory no longer exists.')
    }
  }

  const dangerousArgs: string[] = []
  if (permissionMode === 'dangerous' && cli.skipPermissions) {
    const flag = cli.skipPermissionsFlag || '--dangerously-skip-permissions'
    dangerousArgs.push(flag)
  }

  // --- launch ---
  try {
    // A `wslExecutable` CLI should only be launched via WSL when no native
    // Windows build is present. If the executable exists natively, prefer that.
    const isWsl = isWindows && !!cli.wslExecutable && !(await nativeExecutablePresentAsync(cli.executable))
    const configured = getConfiguredTerminal()
    const terminal = configured || (await detectTerminalEmulator())

    let launcher: LauncherFn
    if (isWindows) {
      launcher = getWindowsLauncher(terminal, isWsl)
    } else if (isMac) {
      launcher = MAC_LAUNCHERS[terminal] || MAC_LAUNCHERS['_fallback']
    } else {
      launcher = await getLinuxLauncher(configured)
    }

    const child = launcher(cli.executable, dangerousArgs, folder)

    // A failed spawn (e.g. ENOENT) surfaces asynchronously via an 'error'
    // event rather than a synchronous throw, so wait a tick to catch it before
    // reporting success.
    const spawnError = await new Promise<Error | null>((resolve) => {
      child.on('error', resolve)
      child.unref()
      setImmediate(() => resolve(null))
    })
    if (spawnError) return makeError('SPAWN_FAILED', spawnError.message)

    return { success: true, output: `Opened ${cli.name} in ${terminal}`, errorCode: undefined }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to open terminal'
    return makeError('SPAWN_FAILED', msg)
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
      { timeout: 25000, maxBuffer: 10 * 1024 * 1024 },
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
    resolvePip().then((pip) => {
      execFile(
        pip.exe,
        [...pip.prefix, 'list', '--outdated', '--format=json'],
        { timeout: 25000, maxBuffer: 10 * 1024 * 1024 },
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
    }).catch(() => resolve({}))
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

/** Extracts `owner/repo` from a GitHub homepage URL, if present. */
export function getRepoFromHomepage(homepage?: string): string | null {
  if (!homepage) return null
  const m = homepage.match(/github\.com[/:]([^/]+)\/([^/?#]+)/i)
  if (!m) return null
  const repo = m[2].replace(/\.git$/i, '')
  return `${m[1]}/${repo}`
}

const STANDALONE_CACHE_TTL = 60 * 60 * 1000
const standaloneUpdateCache: Record<string, { ts: number; result: { updateAvailable: boolean; latestVersion?: string } }> = {}

/** Normalizes a release tag/version for comparison (drops a leading `v`). */
function normalizeVersion(v: string): string {
  return v.replace(/^v/i, '').trim()
}

export async function checkStandaloneUpdate(
  cli: CliDefinition,
  installedVersion?: string
): Promise<{ updateAvailable: boolean; latestVersion?: string }> {
  // Standalone CLIs (prebuilt binaries, cargo crates, e.g. aichat, goose,
  // mods, fabric) aren't npm/pip packages, so we can't use `npm view`. When the
  // registry entry links to a GitHub repo we check its latest release instead.
  const repo = getRepoFromHomepage(cli.homepage)
  if (!repo || !installedVersion) return { updateAvailable: false }

  const cached = standaloneUpdateCache[repo]
  if (cached && Date.now() - cached.ts < STANDALONE_CACHE_TTL) {
    return cached.result
  }

  const result = await new Promise<{ updateAvailable: boolean; latestVersion?: string }>((resolve) => {
    const url = `https://api.github.com/repos/${repo}/releases/latest`
    const cmd = isWindows
      ? `powershell -NoProfile -Command "(Invoke-WebRequest -Uri '${url}' -UseBasicParsing).Content"`
      : `curl -fsSL '${url}'`
    exec(cmd, { timeout: 15000, maxBuffer: 2 * 1024 * 1024 }, (err, stdout) => {
      if (err || !stdout) {
        resolve({ updateAvailable: false })
        return
      }
      try {
        const data = JSON.parse(stdout)
        const latest = normalizeVersion(String(data.tag_name || ''))
        if (!latest) {
          resolve({ updateAvailable: false })
          return
        }
        resolve({ updateAvailable: latest !== normalizeVersion(installedVersion), latestVersion: latest })
      } catch {
        resolve({ updateAvailable: false })
      }
    })
  })

  standaloneUpdateCache[repo] = { ts: Date.now(), result }
  return result
}

/** Clears the npm/pip/standalone update caches so a fresh check runs after an
 *  install/update/uninstall. Presence caches are cleared by the caller. */
export function invalidateUpdateCaches() {
  npmOutdatedCache.data = null
  npmOutdatedCache.ts = 0
  pipOutdatedCache.data = null
  pipOutdatedCache.ts = 0
  for (const key of Object.keys(standaloneUpdateCache)) delete standaloneUpdateCache[key]
}

export async function executeCliAction(
  cliId: string,
  action: CliAction,
  onProgress?: (msg: ActionProgressMessage) => void
): Promise<CliActionResult> {
  // Cancel any previous action for this cli so we never have two scripts running
  cancelAction(cliId)
  try {
    const scriptPath = getScriptPath(cliId, action)
    return await runScript(scriptPath, cliId, onProgress)
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export { isWindows }
