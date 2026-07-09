Write-Output "Repairing Auggie..."
npm uninstall -g @augmentcode/auggie
npm install -g @augmentcode/auggie
if ($LASTEXITCODE -eq 0) {
  Write-Output "Auggie repaired successfully"
} else {
  Write-Error "Failed to repair Auggie"
  exit 1
}
