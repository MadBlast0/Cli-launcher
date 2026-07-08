Write-Output "Installing @charmland/crush..."
npm install -g @charmland/crush
if ($LASTEXITCODE -eq 0) {
  Write-Output "Crush installed successfully"
} else {
  Write-Error "Failed to install Crush"
  exit 1
}
