Write-Output "Uninstalling @sourcegraph/cody..."
npm uninstall -g @sourcegraph/cody
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cody CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Cody CLI"
  exit 1
}
