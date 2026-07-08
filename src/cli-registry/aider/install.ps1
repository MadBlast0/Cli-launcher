Write-Output "Installing aider-chat..."
python -m pip install --upgrade aider-chat
if ($LASTEXITCODE -eq 0) {
  Write-Output "Aider installed successfully"
} else {
  Write-Error "Failed to install Aider"
  exit 1
}
