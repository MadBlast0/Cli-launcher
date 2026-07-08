Write-Output "Installing @kilocode/cli..."
npm install -g @kilocode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Kilo CLI installed successfully"
} else {
  Write-Error "Failed to install Kilo CLI"
  exit 1
}
