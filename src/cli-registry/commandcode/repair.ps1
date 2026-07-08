Write-Output "Repairing command-code..."
npm uninstall -g command-code
npm install -g command-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Command Code repaired successfully"
} else {
  Write-Error "Failed to repair Command Code"
  exit 1
}
