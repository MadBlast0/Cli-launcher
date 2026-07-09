Write-Output "Updating @sourcegraph/cody..."
npm install -g @sourcegraph/cody@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cody CLI updated successfully"
} else {
  Write-Error "Failed to update Cody CLI"
  exit 1
}
