Write-Output "Uninstalling Continue CLI..."
npm uninstall -g @continuedev/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Continue CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Continue CLI"
  exit 1
}
