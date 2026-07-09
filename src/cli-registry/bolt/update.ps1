Write-Output "Updating @bolt/cli..."
npm install -g @bolt/cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Bolt CLI updated successfully"
} else {
  Write-Error "Failed to update Bolt CLI"
  exit 1
}
