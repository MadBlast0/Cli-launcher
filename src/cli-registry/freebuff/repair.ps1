Write-Output "Repairing freebuff..."
npm uninstall -g freebuff
npm install -g freebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Freebuff repaired successfully"
} else {
  Write-Error "Failed to repair Freebuff"
  exit 1
}
