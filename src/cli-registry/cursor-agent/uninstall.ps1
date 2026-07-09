Write-Output "Uninstalling Cursor Agent via WSL..."
wsl -e bash -lc "rm -rf \$HOME/.local/bin/cursor-agent \$HOME/.cursor-agent 2>/dev/null; true"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cursor Agent uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Cursor Agent"
  exit 1
}
