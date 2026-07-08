import { exec } from 'child_process'
import { DependencyCheck } from '../shared/types'

function execCmd(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { timeout: 10000 }, (_error, stdout) => {
      resolve(stdout.trim())
    })
  })
}

export async function checkDependencies(): Promise<DependencyCheck> {
  const nodeVersion = await execCmd('node --version')
  const pythonVersion = await execCmd('python --version')

  return {
    node: {
      installed: nodeVersion.length > 0 && nodeVersion.startsWith('v'),
      version: nodeVersion || undefined,
    },
    python: {
      installed: pythonVersion.toLowerCase().startsWith('python'),
      version: pythonVersion || undefined,
    },
  }
}

export async function installNode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi'
    const downloader = `
      $url = "${url}"
      $output = "$env:TEMP\\node-installer.msi"
      Write-Output "Downloading Node.js..."
      Invoke-WebRequest -Uri $url -OutFile $output
      Write-Output "Installing Node.js..."
      Start-Process msiexec.exe -Wait -ArgumentList "/i $output /qn"
      Write-Output "Node.js installed successfully"
    `
    exec(
      `powershell -NoProfile -Command "${downloader.replace(/"/g, '\\"')}"`,
      { timeout: 300000 },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message))
        else resolve(stdout)
      }
    )
  })
}

export async function installPython(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe'
    const downloader = `
      $url = "${url}"
      $output = "$env:TEMP\\python-installer.exe"
      Write-Output "Downloading Python..."
      Invoke-WebRequest -Uri $url -OutFile $output
      Write-Output "Installing Python..."
      Start-Process $output -Wait -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1"
      Write-Output "Python installed successfully"
    `
    exec(
      `powershell -NoProfile -Command "${downloader.replace(/"/g, '\\"')}"`,
      { timeout: 300000 },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message))
        else resolve(stdout)
      }
    )
  })
}
