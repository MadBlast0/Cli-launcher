import { exec } from 'child_process'
import { platform } from 'os'
import { DependencyCheck } from '../shared/types'

const isWin = platform() === 'win32'
const isMac = platform() === 'darwin'

function execCmd(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { timeout: 10000 }, (_error, stdout) => {
      resolve(stdout.trim())
    })
  })
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

  if (isWin) {
    const url = 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi'
    const output = `${process.env.TEMP}\\node-installer.msi`
    push('Downloading Node.js...')
    await download(url, output)
    push('Installing Node.js...')
    await new Promise<void>((resolve, reject) => {
      exec(`msiexec.exe /i "${output}" /qn`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else if (isMac) {
    push('Downloading Node.js...')
    const url = 'https://nodejs.org/dist/v22.14.0/node-v22.14.0.pkg'
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
    push('Installing Node.js via NodeSource...')
    await new Promise<void>((resolve, reject) => {
      exec('curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs', { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  push('Node.js installed successfully')
  return lines.join('\n')
}

export async function installPython(): Promise<string> {
  const lines: string[] = []
  const push = (s: string) => lines.push(s)

  if (isWin) {
    const url = 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe'
    const output = `${process.env.TEMP}\\python-installer.exe`
    push('Downloading Python...')
    await download(url, output)
    push('Installing Python...')
    await new Promise<void>((resolve, reject) => {
      exec(`"${output}" /quiet InstallAllUsers=1 PrependPath=1`, { timeout: 300000 }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } else if (isMac) {
    push('Downloading Python...')
    const url = 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-macos11.pkg'
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

  push('Python installed successfully')
  return lines.join('\n')
}
