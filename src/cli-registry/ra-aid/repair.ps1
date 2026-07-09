Write-Output "Repairing RA.Aid..."
python -m pip uninstall -y ra-aid
python -m pip install --upgrade ra-aid
if ($LASTEXITCODE -eq 0) {
  Write-Output "RA.Aid repaired successfully"
} else {
  Write-Error "Failed to repair RA.Aid"
  exit 1
}
