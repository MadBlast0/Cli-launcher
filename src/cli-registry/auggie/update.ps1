Write-Output "Updating Auggie..."
npm install -g @augmentcode/auggie@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Auggie updated successfully"
} else {
  Write-Error "Failed to update Auggie"
  exit 1
}
