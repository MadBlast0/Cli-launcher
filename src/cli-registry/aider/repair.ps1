Write-Output "Repairing aider-chat..."
python -m pip uninstall -y aider-chat
python -m pip install --upgrade aider-chat
if ($LASTEXITCODE -eq 0) {
  Write-Output "Aider repaired successfully"
} else {
  Write-Error "Failed to repair Aider"
  exit 1
}
