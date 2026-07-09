Write-Output "Updating cline..."
npm install -g cline@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "cline updated successfully"
} else {
  Write-Error "Failed to update cline"
  exit 1
}
