Write-Output "Uninstalling Plandex via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) { Write-Error "WSL is required. Install it with: wsl --install"; exit 1 }
wsl -e bash -lc "rm -f \$(command -v plandex) \$(command -v pdx) 2>/dev/null; true"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Plandex uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Plandex"
  exit 1
}
