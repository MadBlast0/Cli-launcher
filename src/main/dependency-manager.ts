import { exec } from 'child_process'
import { platform } from 'os'
import { DependencyCheck } from '../shared/types'

const isWin = platform() === 'win32'
const isMac = platform() === 'darwin'

function execCmd(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000 }, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout.trim())
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

async function getLatestNodeVersion(): Promise<string> {
  try {
    const html = await fetchText('https://nodejs.org/dist/index.json')
    const releases = JSON.parse(html)
    const latest = releases.find((r: any) => r.lts) || releases[0]
    return latest.version.replace(/^v/, '')
  } catch {
    return '22.14.0'
  }
}

async function getLatestPythonVersion(): Promise<string> {
  try {
    const html = await fetchText('https://www.python.org/ftp/python/')
    const versions = html.match(/(\d+\.\d+\.\d+)\/?/g)
    if (versions) {
      const sorted = versions.map(v => v.replace(/\/$/, '')).sort().reverse()
      return sorted[0] || '3.12.8'
    }
  } catch { /* ignore */ }
  return '3.12.8'
}

export async function checkDependencies(): Promise<DependencyCheck> {
  const nodeCmd = isWin ? 'node --version' : 'command -v node && node --version || echo ""'
  const pythonCmd = isWin ? 'python --version' : 'command -v python3 && python3 --version || command -v python && python --version || echo ""'

  const nodeVersion = await execCmd(nodeCmd)
  const pythonVersion = await execCmd(pythonCmd)

  return {
    node: {
      installed: nodeVersion.length > 0 && nodeVersion.startsWith('v'),
      version: nodeVersion || undefined,
    },
    python: {
      installed: pythonVersion.toLowerCase().includes('python'),
      version: pythonVersion || undefined,
    },
  }
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
  const nodeVersion = await getLatestNodeVersion()
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
    push('Installing Node.js...')
    await new Promise<void>((resolve, reject) => {
      exec(`sudo installer -pkg "${output}" -target /`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else {
    push(`Installing Node.js v${nodeVersion} via NodeSource...`)
    await new Promise<void>((resolve, reject) => {
      exec(`curl -fsSL https://deb.nodesource.com/setup_${major}.x | sudo -E bash - && sudo apt-get install -y nodejs`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  push(`Node.js v${nodeVersion} installed successfully`)
  return lines.join('\n')
}

export async function installPython(): Promise<string> {
  const lines: string[] = []
  const push = (s: string) => lines.push(s)
  const pythonVersion = await getLatestPythonVersion()

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
    push('Installing Python...')
    await new Promise<void>((resolve, reject) => {
      exec(`sudo installer -pkg "${output}" -target /`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else {
    push('Installing Python via apt...')
    await new Promise<void>((resolve, reject) => {
      exec('sudo apt-get update && sudo apt-get install -y python3 python3-pip', { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  push(`Python ${pythonVersion} installed successfully`)
  return lines.join('\n')
}
