Write-Output "Updating command-code..."
npm install -g command-code@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Command Code updated successfully"
} else {
  Write-Error "Failed to update Command Code"
  exit 1
}
