Write-Output "Uninstalling @charmland/crush..."
npm uninstall -g @charmland/crush
if ($LASTEXITCODE -eq 0) {
  Write-Output "Crush uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Crush"
  exit 1
}
