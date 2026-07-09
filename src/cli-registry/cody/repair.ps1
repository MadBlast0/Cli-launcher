Write-Output "Repairing @sourcegraph/cody..."
npm uninstall -g @sourcegraph/cody
npm install -g @sourcegraph/cody
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cody CLI repaired successfully"
} else {
  Write-Error "Failed to repair Cody CLI"
  exit 1
}
