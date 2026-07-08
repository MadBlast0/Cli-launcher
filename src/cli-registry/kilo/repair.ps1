Write-Output "Repairing @kilocode/cli..."
npm uninstall -g @kilocode/cli
npm install -g @kilocode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Kilo CLI repaired successfully"
} else {
  Write-Error "Failed to repair Kilo CLI"
  exit 1
}
