Write-Output "Uninstalling replit-agent..."
npm uninstall -g replit-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Replit Agent uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Replit Agent"
  exit 1
}
