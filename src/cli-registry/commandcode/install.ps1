Write-Output "Installing command-code..."
npm install -g command-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Command Code installed successfully"
} else {
  Write-Error "Failed to install Command Code"
  exit 1
}
