Write-Output "Repairing @mariozechner/pi-coding-agent..."
npm uninstall -g @mariozechner/pi-coding-agent
npm install -g @mariozechner/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "PI Coding Agent repaired successfully"
} else {
  Write-Error "Failed to repair PI Coding Agent"
  exit 1
}
