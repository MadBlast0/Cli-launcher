Write-Output "Updating Goose CLI..."
npm install -g @block/goose@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Goose CLI updated successfully"
} else {
  Write-Error "Failed to update Goose CLI"
  exit 1
}
