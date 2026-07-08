Write-Output "Uninstalling Goose CLI..."
npm uninstall -g @block/goose
if ($LASTEXITCODE -eq 0) {
  Write-Output "Goose CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Goose CLI"
  exit 1
}
