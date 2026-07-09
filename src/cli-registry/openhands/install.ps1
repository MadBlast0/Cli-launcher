Write-Output "Installing OpenHands CLI..."
python -m pip install --upgrade openhands-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "OpenHands CLI installed successfully"
} else {
  Write-Error "Failed to install OpenHands CLI"
  exit 1
}
