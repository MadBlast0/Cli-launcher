Write-Output "Uninstalling @kilocode/cli..."
npm uninstall -g @kilocode/cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Kilo CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Kilo CLI"
  exit 1
}
