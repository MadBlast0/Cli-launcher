Write-Output "Updating opencode-ai..."
npm install -g opencode-ai@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "opencode updated successfully"
} else {
  Write-Error "Failed to update opencode"
  exit 1
}
