Write-Output "Uninstalling cline..."
npm uninstall -g cline
if ($LASTEXITCODE -eq 0) {
  Write-Output "cline uninstalled successfully"
} else {
  Write-Error "Failed to uninstall cline"
  exit 1
}
