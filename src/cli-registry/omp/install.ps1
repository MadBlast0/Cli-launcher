Write-Output "Installing Oh My Pi..."
npm install -g @oh-my-pi/pi-coding-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Oh My Pi installed successfully"
} else {
  Write-Error "Failed to install Oh My Pi"
  exit 1
}
