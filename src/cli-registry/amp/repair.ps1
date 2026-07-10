Write-Output "Repairing @ampcode/cli..."
npm uninstall -g @ampcode/cli
npm install -g @ampcode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI repaired successfully"
} else {
  Write-Error "Failed to repair Amp CLI"
  exit 1
}
