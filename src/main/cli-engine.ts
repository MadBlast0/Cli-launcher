import { execFile, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { CliAction, CliActionResult, CliDefinition } from '../shared/types'

function getScriptPath(cliId: string, action: CliAction): string {
  const baseDir = path.join(__dirname, '../../src/cli-registry', cliId)
  const scriptPath = path.join(baseDir, `${action}.ps1`)

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`)
  }
  return scriptPath
}

function runScript(scriptPath: string): Promise<CliActionResult> {
  return new Promise((resolve) => {
    const child = execFile(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, output: stdout, error: stderr || error.message })
        } else {
          resolve({ success: true, output: stdout })
        }
      }
    )
    child.stdin?.end()
  })
}

/**
 * Launch a CLI in a NEW visible terminal window, in the chosen working folder.
 * (There is no open.ps1 — "open" is handled here so it actually spawns a console.)
 */
export function openCli(cli: CliDefinition, folder: string | null): CliActionResult {
  const flag = cli.skipPermissions
    ? ` ${cli.skipPermissionsFlag || '--dangerously-skip-permissions'}`
    : ''
  const exeCmd = `${cli.executable}${flag}`

  // Keep the window open after the CLI exits so the user can read output / re-run.
  const inner = folder
    ? `Set-Location -LiteralPath "${folder}"; ${exeCmd}`
    : exeCmd

  try {
    // `cmd /c start` opens a brand-new console window hosting PowerShell.
    const child = spawn(
      'cmd.exe',
      ['/c', 'start', '', 'powershell', '-NoExit', '-Command', inner],
      { detached: true, stdio: 'ignore', windowsHide: false }
    )
    child.unref()
    return { success: true, output: `Opened ${cli.name}` }
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'Failed to open terminal',
    }
  }
}

/** Detect whether a newer version is published (npm-based CLIs only). */
export function checkCliUpdate(
  cli: CliDefinition
): Promise<{ updateAvailable: boolean; latestVersion?: string }> {
  if (cli.dependencyType !== 'node' || !cli.packageName) {
    return Promise.resolve({ updateAvailable: false })
  }
  const pkg: string = cli.packageName
  return new Promise((resolve) => {
    // `npm outdated` exits 1 when something is outdated; JSON is on stdout regardless.
    execFile(
      'npm',
      ['outdated', '-g', pkg, '--json'],
      { timeout: 25000, shell: true, maxBuffer: 1024 * 1024 },
      (_error: unknown, stdout: string) => {
        try {
          const data = JSON.parse(stdout || '{}')
          const entry = data[pkg]
          if (entry && entry.current && entry.latest && entry.current !== entry.latest) {
            resolve({ updateAvailable: true, latestVersion: entry.latest })
          } else {
            resolve({ updateAvailable: false })
          }
        } catch {
          resolve({ updateAvailable: false })
        }
      }
    )
  })
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
