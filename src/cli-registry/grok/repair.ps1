Write-Output "Repairing Grok CLI..."
npm uninstall -g @vibe-kit/grok-cli
npm install -g @vibe-kit/grok-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Grok CLI repaired successfully"
} else {
  Write-Error "Failed to repair Grok CLI"
  exit 1
}
