import { exec } from 'child_process'
import { platform } from 'os'
import { DependencyCheck } from '../shared/types'
import { qSH } from './terminal-serializers'

const isWin = platform() === 'win32'
const isMac = platform() === 'darwin'

// A version string is only ever `MAJOR.MINOR.PATCH` digits. Anything else is
// rejected so a poisoned remote response can't inject shell/URL metacharacters
// into the download command that interpolates it.
const SAFE_VERSION = /^\d+\.\d+\.\d+$/
function safeVersion(v: string, fallback: string): string {
  return SAFE_VERSION.test(v) ? v : fallback
}

// Resolves with the trimmed stdout, or '' when the command fails. Detection
// must never throw just because a runtime is absent (that previously left the
// dependency panel stuck with no data).
function execCmd(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { timeout: 10000 }, (error, stdout) => {
      resolve(error ? '' : (stdout || '').trim())
    })
  })
}

function fetchText(url: string): Promise<string> {
  const cmd = isWin
    ? `powershell -NoProfile -Command "(Invoke-WebRequest -Uri '${url}' -UseBasicParsing).Content"`
    : `curl -fsSL '${url}'`
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 15000 }, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout.trim())
    })
  })
}

// Lightweight HEAD-style reachability probe for an installer URL. Used to
// avoid downloading a detected "latest" version whose binary isn't actually
// published at the expected path (which 404s). Returns false on any error.
async function isUrlReachable(url: string): Promise<boolean> {
  const cmd = isWin
    ? `powershell -NoProfile -Command "(Invoke-WebRequest -Uri '${url}' -Method Head -UseBasicParsing).StatusCode"`
    : `curl -fsSIL -o /dev/null -w '%{http_code}' '${url}'`
  try {
    const out = await execCmd(cmd)
    const code = (out.match(/\d{3}/) || [''])[0]
    return code === '200' || code === '301' || code === '302' || code === '308'
  } catch {
    return false
  }
}

async function getLatestNodeVersion(): Promise<string> {
  try {
    const html = await fetchText('https://nodejs.org/dist/index.json')
    const releases = JSON.parse(html)
    const latest = releases.find((r: any) => r.lts) || releases[0]
    return safeVersion(String(latest.version).replace(/^v/, ''), '22.14.0')
  } catch {
    return '22.14.0'
  }
}

async function getLatestPythonVersion(): Promise<string> {
  try {
    const html = await fetchText('https://www.python.org/ftp/python/')
    const versions = html.match(/(\d+\.\d+\.\d+)\/?/g)
    if (versions) {
      const clean = versions.map((v) => v.replace(/\/$/, ''))
      const sorted = clean
        .sort((a, b) => {
          const pa = a.split('.').map(Number)
          const pb = b.split('.').map(Number)
          const len = Math.max(pa.length, pb.length)
          for (let i = 0; i < len; i++) {
            const x = pa[i] || 0
            const y = pb[i] || 0
            if (x !== y) return x - y
          }
          return 0
        })
        .reverse()
      return safeVersion(sorted[0] || '', '3.12.8')
    }
  } catch { /* ignore */ }
  return '3.12.8'
}

export async function checkDependencies(): Promise<DependencyCheck> {
  const nodeCmd = isWin ? 'node --version' : 'command -v node && node --version || echo ""'
  const pythonCmd = isWin ? 'python --version' : 'command -v python3 && python3 --version || command -v python && python --version || echo ""'

  const nodeVersion = await execCmd(nodeCmd)
  let pythonVersion = await execCmd(pythonCmd)
  // On Windows, `python` may be the Microsoft Store stub (prints nothing / errors).
  // Fall back to the `py` launcher before deciding Python is missing. Detect a
  // real Python by looking for a version-like string rather than the word
  // "python", which avoids false-pos/neg on stubs and localized output.
  if (isWin && !/\d+\.\d+/.test(pythonVersion)) {
    pythonVersion = await execCmd('py --version')
  }

  return {
    node: {
      installed: nodeVersion.length > 0 && nodeVersion.startsWith('v'),
      version: nodeVersion || undefined,
    },
    python: {
      installed: /\d+\.\d+/.test(pythonVersion),
      version: pythonVersion || undefined,
    },
  }
}

/** Whether a command is resolvable on PATH (Unix). */
function unixHasCommand(cmd: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`command -v ${cmd}`, { timeout: 5000 }, (error, stdout) => {
      resolve(!error && !!stdout.trim())
    })
  })
}

type LinuxPackageManager = 'apt' | 'dnf' | 'pacman'

/** Detects the system package manager on Linux so dependency install isn't
 *  hard-wired to Debian/apt. Returns null when none of the supported managers
 *  are present. */
async function detectLinuxPackageManager(): Promise<LinuxPackageManager | null> {
  if (isWin || isMac) return null
  const candidates: { pm: LinuxPackageManager; bin: string }[] = [
    { pm: 'apt', bin: 'apt-get' },
    { pm: 'dnf', bin: 'dnf' },
    { pm: 'pacman', bin: 'pacman' },
  ]
  for (const c of candidates) {
    if (await unixHasCommand(c.bin)) return c.pm
  }
  return null
}

const UNSUPPORTED_LINUX_MSG =
  'Unsupported Linux distribution: could not find apt, dnf, or pacman. ' +
  'Please install Node.js/Python manually.'

/**
 * Runs a shell command with elevated privileges via a GRAPHICAL prompt, because
 * the app has no controlling TTY — a plain `sudo` would hang or fail. macOS uses
 * osascript's "with administrator privileges" dialog; Linux uses PolicyKit's
 * `pkexec`. If no graphical elevation path exists we reject with an actionable
 * message instead of silently blocking on a password that can never be typed.
 */
async function runElevated(innerCmd: string, timeout: number): Promise<void> {
  let cmd: string
  if (isMac) {
    const escaped = innerCmd.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    cmd = `osascript -e 'do shell script "${escaped}" with administrator privileges'`
  } else {
    if (!(await unixHasCommand('pkexec'))) {
      throw new Error(
        "Automatic install needs 'pkexec' (PolicyKit) for a graphical admin prompt. " +
        'Please install it, or install Node.js/Python manually.'
      )
    }
    cmd = `pkexec bash -c ${qSH(innerCmd)}`
  }
  await new Promise<void>((resolve, reject) => {
    exec(cmd, { timeout }, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function download(url: string, output: string): Promise<void> {
  const cmd = isWin
    ? `powershell -NoProfile -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${output}'"`
    : `curl -fsSL '${url}' -o '${output}'`
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export async function installNode(): Promise<string> {
  const lines: string[] = []
  const push = (s: string) => lines.push(s)
  const nodeVersion0 = await getLatestNodeVersion()
  let nodeVersion = nodeVersion0

  // The detected "latest" may not have a published installer yet at the
  // expected path; fall back to a known-good version if the URL 404s.
  if (isWin || isMac) {
    const nodeUrl = (v: string) =>
      isWin
        ? `https://nodejs.org/dist/v${v}/node-v${v}-x64.msi`
        : `https://nodejs.org/dist/v${v}/node-v${v}.pkg`
    if (!(await isUrlReachable(nodeUrl(nodeVersion)))) {
      const fallback = '22.14.0'
      if (await isUrlReachable(nodeUrl(fallback))) {
        nodeVersion = fallback
      }
    }
  }
  const major = nodeVersion.split('.')[0]

  if (isWin) {
    const url = `https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-x64.msi`
    const output = `${process.env.TEMP}\\node-installer.msi`
    push(`Downloading Node.js v${nodeVersion}...`)
    await download(url, output)
    push('Installing Node.js...')
    await new Promise<void>((resolve, reject) => {
      exec(`msiexec.exe /i "${output}" /qn`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else if (isMac) {
    push(`Downloading Node.js v${nodeVersion}...`)
    const url = `https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}.pkg`
    const output = '/tmp/node-installer.pkg'
    await download(url, output)
    push('Installing Node.js (admin authorization required)...')
    await runElevated(`installer -pkg "${output}" -target /`, 300000)
  } else {
    const pm = await detectLinuxPackageManager()
    if (pm === 'apt') {
      push(`Installing Node.js v${nodeVersion} via NodeSource (admin authorization required)...`)
      await runElevated(
        `curl -fsSL https://deb.nodesource.com/setup_${major}.x | bash - && apt-get install -y nodejs`,
        300000
      )
    } else if (pm === 'dnf') {
      push(`Installing Node.js v${nodeVersion} via dnf (admin authorization required)...`)
      await runElevated('dnf install -y nodejs npm', 300000)
    } else if (pm === 'pacman') {
      push(`Installing Node.js v${nodeVersion} via pacman (admin authorization required)...`)
      await runElevated('pacman -S --noconfirm nodejs npm', 300000)
    } else {
      throw new Error(UNSUPPORTED_LINUX_MSG)
    }
  }

  push(`Node.js v${nodeVersion} installed successfully`)
  return lines.join('\n')
}

export async function installPython(): Promise<string> {
  const lines: string[] = []
  const push = (s: string) => lines.push(s)
  let pythonVersion = await getLatestPythonVersion()

  // The detected "latest" may not have a published installer yet at the
  // expected path (e.g. 404); fall back to a known-good version.
  if (isWin || isMac) {
    const pythonUrl = (v: string) =>
      isWin
        ? `https://www.python.org/ftp/python/${v}/python-${v}-amd64.exe`
        : `https://www.python.org/ftp/python/${v}/python-${v}-macos11.pkg`
    if (!(await isUrlReachable(pythonUrl(pythonVersion)))) {
      const fallback = '3.12.8'
      if (await isUrlReachable(pythonUrl(fallback))) {
        pythonVersion = fallback
      }
    }
  }

  if (isWin) {
    const url = `https://www.python.org/ftp/python/${pythonVersion}/python-${pythonVersion}-amd64.exe`
    const output = `${process.env.TEMP}\\python-installer.exe`
    push(`Downloading Python ${pythonVersion}...`)
    await download(url, output)
    push('Installing Python...')
    await new Promise<void>((resolve, reject) => {
      exec(`"${output}" /quiet InstallAllUsers=1 PrependPath=1`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else if (isMac) {
    push(`Downloading Python ${pythonVersion}...`)
    const url = `https://www.python.org/ftp/python/${pythonVersion}/python-${pythonVersion}-macos11.pkg`
    const output = '/tmp/python-installer.pkg'
    await download(url, output)
    push('Installing Python (admin authorization required)...')
    await runElevated(`installer -pkg "${output}" -target /`, 300000)
  } else {
    const pm = await detectLinuxPackageManager()
    if (pm === 'apt') {
      push('Installing Python via apt (admin authorization required)...')
      await runElevated('apt-get update && apt-get install -y python3 python3-pip', 300000)
    } else if (pm === 'dnf') {
      push('Installing Python via dnf (admin authorization required)...')
      await runElevated('dnf install -y python3 python3-pip', 300000)
    } else if (pm === 'pacman') {
      push('Installing Python via pacman (admin authorization required)...')
      await runElevated('pacman -S --noconfirm python python-pip', 300000)
    } else {
      throw new Error(UNSUPPORTED_LINUX_MSG)
    }
  }

  push(`Python ${pythonVersion} installed successfully`)
  return lines.join('\n')
}
