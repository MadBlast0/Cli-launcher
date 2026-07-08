Write-Output "Uninstalling opencode-ai..."
npm uninstall -g opencode-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "opencode uninstalled successfully"
} else {
  Write-Error "Failed to uninstall opencode"
  exit 1
}
