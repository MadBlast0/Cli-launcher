Write-Output "Uninstalling Cursor CLI..."
# Cursor has no dedicated uninstaller; remove the installed binary's folder.
$cmd = Get-Command agent -ErrorAction SilentlyContinue
if (-not $cmd) { $cmd = Get-Command cursor-agent -ErrorAction SilentlyContinue }
if ($cmd) {
  $dir = Split-Path -Parent $cmd.Source
  Write-Output "Removing $dir"
  Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
}
# Common install locations as a fallback.
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\agent'),
  (Join-Path $env:LOCALAPPDATA 'Programs\cursor-agent'),
  (Join-Path $env:LOCALAPPDATA 'Programs\cursor-cli'),
  (Join-Path $env:USERPROFILE '.local\bin\agent'),
  (Join-Path $env:USERPROFILE '.local\bin\cursor-agent'),
  (Join-Path $env:USERPROFILE '.cursor')
)
foreach ($p in $candidates) {
  if (Test-Path $p) { Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue }
}
Write-Output "Cursor CLI uninstalled"
