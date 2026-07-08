Write-Output "Installing @github/copilot..."
npm install -g @github/copilot
if ($LASTEXITCODE -eq 0) {
  Write-Output "GitHub Copilot CLI installed successfully"
} else {
  Write-Error "Failed to install GitHub Copilot CLI"
  exit 1
}
