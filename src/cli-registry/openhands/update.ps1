Write-Output "Updating OpenHands CLI..."
python -m pip install --upgrade openhands-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "OpenHands CLI updated successfully"
} else {
  Write-Error "Failed to update OpenHands CLI"
  exit 1
}
