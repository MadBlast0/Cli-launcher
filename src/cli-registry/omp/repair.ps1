Write-Output "Repairing Oh My Pi..."
npm uninstall -g @oh-my-pi/pi-coding-agent
npm install -g @oh-my-pi/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Oh My Pi repaired successfully"
} else {
  Write-Error "Failed to repair Oh My Pi"
  exit 1
}
