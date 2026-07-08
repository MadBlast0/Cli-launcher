Write-Output "Repairing Goose CLI..."
npm uninstall -g @block/goose
npm install -g @block/goose
if ($LASTEXITCODE -eq 0) {
  Write-Output "Goose CLI repaired successfully"
} else {
  Write-Error "Failed to repair Goose CLI"
  exit 1
}
