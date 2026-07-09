Write-Output "Installing @bolt/cli..."
npm install -g @bolt/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Bolt CLI installed successfully"
} else {
  Write-Error "Failed to install Bolt CLI"
  exit 1
}
