Write-Output "Updating Oh My Pi..."
npm install -g @oh-my-pi/pi-coding-agent@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Oh My Pi updated successfully"
} else {
  Write-Error "Failed to update Oh My Pi"
  exit 1
}
