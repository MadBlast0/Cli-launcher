Write-Output "Installing @ampcode/cli..."
npm install -g @ampcode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI installed successfully"
} else {
  Write-Error "Failed to install Amp CLI"
  exit 1
}
