Write-Output "Installing Grok CLI..."
npm install -g @vibe-kit/grok-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Grok CLI installed successfully"
} else {
  Write-Error "Failed to install Grok CLI"
  exit 1
}
