Write-Output "Repairing @bolt/cli..."
npm uninstall -g @bolt/cli
npm install -g @bolt/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Bolt CLI repaired successfully"
} else {
  Write-Error "Failed to repair Bolt CLI"
  exit 1
}
