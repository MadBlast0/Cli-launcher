Write-Output "Repairing @charmland/crush..."
npm uninstall -g @charmland/crush
npm install -g @charmland/crush
if ($LASTEXITCODE -eq 0) {
  Write-Output "Crush repaired successfully"
} else {
  Write-Error "Failed to repair Crush"
  exit 1
}
