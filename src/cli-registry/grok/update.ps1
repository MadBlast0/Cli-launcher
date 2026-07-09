Write-Output "Updating Grok CLI..."
npm install -g @vibe-kit/grok-cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Grok CLI updated successfully"
} else {
  Write-Error "Failed to update Grok CLI"
  exit 1
}
