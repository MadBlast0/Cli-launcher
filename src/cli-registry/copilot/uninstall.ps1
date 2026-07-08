Write-Output "Uninstalling @github/copilot..."
npm uninstall -g @github/copilot
if ($LASTEXITCODE -eq 0) {
  Write-Output "GitHub Copilot CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall GitHub Copilot CLI"
  exit 1
}
