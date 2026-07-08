Write-Output "Updating @mariozechner/pi-coding-agent..."
npm install -g @mariozechner/pi-coding-agent@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "PI Coding Agent updated successfully"
} else {
  Write-Error "Failed to update PI Coding Agent"
  exit 1
}
