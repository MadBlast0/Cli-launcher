Write-Output "Installing RA.Aid..."
python -m pip install --upgrade ra-aid
if ($LASTEXITCODE -eq 0) {
  Write-Output "RA.Aid installed successfully"
} else {
  Write-Error "Failed to install RA.Aid"
  exit 1
}
