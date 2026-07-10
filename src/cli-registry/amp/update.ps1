Write-Output "Updating @ampcode/cli..."
npm install -g @ampcode/cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI updated successfully"
} else {
  Write-Error "Failed to update Amp CLI"
  exit 1
}
