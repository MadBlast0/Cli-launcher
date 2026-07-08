Write-Output "Uninstalling freebuff..."
npm uninstall -g freebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Freebuff uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Freebuff"
  exit 1
}
