Write-Output "Updating @sourcegraph/amp..."
npm install -g @sourcegraph/amp@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI updated successfully"
} else {
  Write-Error "Failed to update Amp CLI"
  exit 1
}
