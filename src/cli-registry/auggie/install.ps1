Write-Output "Installing Auggie..."
npm install -g @augmentcode/auggie
if ($LASTEXITCODE -eq 0) {
  Write-Output "Auggie installed successfully"
} else {
  Write-Error "Failed to install Auggie"
  exit 1
}
