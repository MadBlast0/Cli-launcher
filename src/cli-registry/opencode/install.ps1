Write-Output "Installing opencode-ai..."
npm install -g opencode-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "opencode installed successfully"
} else {
  Write-Error "Failed to install opencode"
  exit 1
}
