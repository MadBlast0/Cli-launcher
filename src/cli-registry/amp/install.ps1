Write-Output "Installing @sourcegraph/amp..."
npm install -g @sourcegraph/amp
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI installed successfully"
} else {
  Write-Error "Failed to install Amp CLI"
  exit 1
}
