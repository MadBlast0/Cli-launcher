Write-Output "Uninstalling ski-cli..."
npm uninstall -g ski-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Ski CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Ski CLI"
  exit 1
}
