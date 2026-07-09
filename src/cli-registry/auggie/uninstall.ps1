Write-Output "Uninstalling Auggie..."
npm uninstall -g @augmentcode/auggie
if ($LASTEXITCODE -eq 0) {
  Write-Output "Auggie uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Auggie"
  exit 1
}
