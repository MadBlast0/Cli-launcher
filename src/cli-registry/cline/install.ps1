Write-Output "Installing cline..."
npm install -g cline
if ($LASTEXITCODE -eq 0) {
  Write-Output "cline installed successfully"
} else {
  Write-Error "Failed to install cline"
  exit 1
}
