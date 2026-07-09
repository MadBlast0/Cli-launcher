Write-Output "Repairing replit-agent..."
npm uninstall -g replit-agent
npm install -g replit-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Replit Agent repaired successfully"
} else {
  Write-Error "Failed to repair Replit Agent"
  exit 1
}
