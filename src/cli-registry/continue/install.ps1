Write-Output "Installing Continue CLI..."
npm install -g @continuedev/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Continue CLI installed successfully"
} else {
  Write-Error "Failed to install Continue CLI"
  exit 1
}
