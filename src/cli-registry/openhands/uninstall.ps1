Write-Output "Uninstalling OpenHands CLI..."
python -m pip uninstall -y openhands-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "OpenHands CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall OpenHands CLI"
  exit 1
}
