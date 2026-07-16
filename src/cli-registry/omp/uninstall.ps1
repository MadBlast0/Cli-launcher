Write-Output "Uninstalling Oh My Pi..."
npm uninstall -g @oh-my-pi/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Oh My Pi uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Oh My Pi"
  exit 1
}
