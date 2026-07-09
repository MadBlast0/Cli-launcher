Write-Output "Repairing OpenHands CLI..."
python -m pip uninstall -y openhands-ai
python -m pip install --upgrade openhands-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "OpenHands CLI repaired successfully"
} else {
  Write-Error "Failed to repair OpenHands CLI"
  exit 1
}
