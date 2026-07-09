Write-Output "Uninstalling Plandex via WSL..."
wsl -e bash -lc "rm -f \$(command -v plandex) \$(command -v pdx) 2>/dev/null; true"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Plandex uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Plandex"
  exit 1
}
