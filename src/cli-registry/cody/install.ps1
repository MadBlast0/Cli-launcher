Write-Output "Installing @sourcegraph/cody..."
npm install -g @sourcegraph/cody
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cody CLI installed successfully"
} else {
  Write-Error "Failed to install Cody CLI"
  exit 1
}
