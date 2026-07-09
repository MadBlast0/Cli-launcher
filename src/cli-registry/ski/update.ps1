Write-Output "Updating ski-cli..."
npm install -g ski-cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Ski CLI updated successfully"
} else {
  Write-Error "Failed to update Ski CLI"
  exit 1
}
