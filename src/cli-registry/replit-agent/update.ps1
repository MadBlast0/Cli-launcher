Write-Output "Updating replit-agent..."
npm install -g replit-agent@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Replit Agent updated successfully"
} else {
  Write-Error "Failed to update Replit Agent"
  exit 1
}
