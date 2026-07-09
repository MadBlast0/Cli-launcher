Write-Output "Uninstalling @bolt/cli..."
npm uninstall -g @bolt/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Bolt CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Bolt CLI"
  exit 1
}
