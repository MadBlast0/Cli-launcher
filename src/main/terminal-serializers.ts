// ---------------------------------------------------------------------------
// Parser-boundary serializers
//
// Each function quotes a value for exactly one parser.  Do not reuse across
// different parsers without verifying equivalence.
// ---------------------------------------------------------------------------

/** PowerShell single-quoted literal: only `'` needs doubling. */
export function qPS(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/** POSIX single-quoted literal: only `'` needs the `'"'"'` escape. */
export function qSH(value: string): string {
  return `'${value.replace(/'/g, "'\"'\"'")}'`
}

/** Windows cmd.exe argument — wrap in `"` and escape embedded `"` by doubling. */
export function qCMD(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

/** Build a PowerShell command-string that calls `& 'exe' 'arg1' …` */
export function buildPSCommand(exe: string, args: string[], folder: string | null): string {
  const dir = folder ? `Set-Location -LiteralPath ${qPS(folder)}; ` : ''
  const tokens = [exe, ...args].map(qPS).join(' ')
  return `${dir}& ${tokens}`
}

/** Build a WSL bash command-string (POSIX-quoted, single argument to bash -lc). */
export function buildWSLCommand(exe: string, args: string[], folder: string | null): string {
  const dir = folder ? `cd ${qSH(folder.replace(/\\/g, '/'))} && ` : ''
  const tokens = [exe, ...args].map(qSH).join(' ')
  return `${dir}${tokens}`
}
