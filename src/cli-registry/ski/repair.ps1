Write-Output "Repairing ski-cli..."
npm uninstall -g ski-cli
npm install -g ski-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Ski CLI repaired successfully"
} else {
  Write-Error "Failed to repair Ski CLI"
  exit 1
}
