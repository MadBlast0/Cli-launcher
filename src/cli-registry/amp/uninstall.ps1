Write-Output "Uninstalling @ampcode/cli..."
npm uninstall -g @ampcode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Amp CLI"
  exit 1
}
