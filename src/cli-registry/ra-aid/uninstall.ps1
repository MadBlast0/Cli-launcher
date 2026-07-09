Write-Output "Uninstalling RA.Aid..."
python -m pip uninstall -y ra-aid
if ($LASTEXITCODE -eq 0) {
  Write-Output "RA.Aid uninstalled successfully"
} else {
  Write-Error "Failed to uninstall RA.Aid"
  exit 1
}
