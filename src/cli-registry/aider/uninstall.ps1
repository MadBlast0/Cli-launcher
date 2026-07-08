Write-Output "Uninstalling aider-chat..."
python -m pip uninstall -y aider-chat
if ($LASTEXITCODE -eq 0) {
  Write-Output "Aider uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Aider"
  exit 1
}
