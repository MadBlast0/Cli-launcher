Write-Output "Repairing @sourcegraph/amp..."
npm uninstall -g @sourcegraph/amp
npm install -g @sourcegraph/amp
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI repaired successfully"
} else {
  Write-Error "Failed to repair Amp CLI"
  exit 1
}
