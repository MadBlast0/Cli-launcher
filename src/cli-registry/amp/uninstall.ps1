Write-Output "Uninstalling @sourcegraph/amp..."
npm uninstall -g @sourcegraph/amp
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amp CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Amp CLI"
  exit 1
}
