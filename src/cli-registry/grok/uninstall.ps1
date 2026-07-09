Write-Output "Uninstalling Grok CLI..."
npm uninstall -g @vibe-kit/grok-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Grok CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Grok CLI"
  exit 1
}
