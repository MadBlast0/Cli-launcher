Write-Output "Uninstalling command-code..."
npm uninstall -g command-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Command Code uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Command Code"
  exit 1
}
