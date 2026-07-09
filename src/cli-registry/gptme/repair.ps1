Write-Output "Repairing gptme..."
python -m pip uninstall -y gptme
python -m pip install --upgrade gptme
if ($LASTEXITCODE -eq 0) {
  Write-Output "gptme repaired successfully"
} else {
  Write-Error "Failed to repair gptme"
  exit 1
}
