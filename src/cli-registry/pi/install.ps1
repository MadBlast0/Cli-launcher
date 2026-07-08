Write-Output "Installing @mariozechner/pi-coding-agent..."
npm install -g @mariozechner/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "PI Coding Agent installed successfully"
} else {
  Write-Error "Failed to install PI Coding Agent"
  exit 1
}
