Write-Output "Updating freebuff..."
npm install -g freebuff@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Freebuff updated successfully"
} else {
  Write-Error "Failed to update Freebuff"
  exit 1
}
