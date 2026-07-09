Write-Output "Repairing cline..."
npm uninstall -g cline
npm install -g cline
if ($LASTEXITCODE -eq 0) {
  Write-Output "cline repaired successfully"
} else {
  Write-Error "Failed to repair cline"
  exit 1
}
