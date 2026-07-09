Write-Output "Repairing Continue CLI..."
npm uninstall -g @continuedev/cli
npm install -g @continuedev/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Continue CLI repaired successfully"
} else {
  Write-Error "Failed to repair Continue CLI"
  exit 1
}
