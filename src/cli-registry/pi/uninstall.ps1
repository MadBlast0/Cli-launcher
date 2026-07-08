Write-Output "Uninstalling @mariozechner/pi-coding-agent..."
npm uninstall -g @mariozechner/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "PI Coding Agent uninstalled successfully"
} else {
  Write-Error "Failed to uninstall PI Coding Agent"
  exit 1
}
