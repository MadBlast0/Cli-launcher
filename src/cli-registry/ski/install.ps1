Write-Output "Installing ski-cli..."
npm install -g ski-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Ski CLI installed successfully"
} else {
  Write-Error "Failed to install Ski CLI"
  exit 1
}
