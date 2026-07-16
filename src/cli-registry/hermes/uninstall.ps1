Write-Output "Uninstalling Hermes Agent..."
python -m pip uninstall -y hermes-agent
if ($LASTEXITCODE -eq 0) {
  Write-Output "Hermes Agent uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Hermes Agent"
  exit 1
}
