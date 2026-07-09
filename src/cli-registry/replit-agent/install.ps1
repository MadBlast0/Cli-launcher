Write-Output "Installing replit-agent..."
npm install -g replit-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Replit Agent installed successfully"
} else {
  Write-Error "Failed to install Replit Agent"
  exit 1
}
