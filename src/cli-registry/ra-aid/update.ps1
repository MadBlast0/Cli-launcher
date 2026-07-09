Write-Output "Updating RA.Aid..."
python -m pip install --upgrade ra-aid
if ($LASTEXITCODE -eq 0) {
  Write-Output "RA.Aid updated successfully"
} else {
  Write-Error "Failed to update RA.Aid"
  exit 1
}
