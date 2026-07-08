Write-Output "Updating @charmland/crush..."
npm install -g @charmland/crush@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Crush updated successfully"
} else {
  Write-Error "Failed to update Crush"
  exit 1
}
