Write-Output "Updating aider-chat..."
python -m pip install --upgrade aider-chat
if ($LASTEXITCODE -eq 0) {
  Write-Output "Aider updated successfully"
} else {
  Write-Error "Failed to update Aider"
  exit 1
}
