Write-Output "Uninstalling gptme..."
python -m pip uninstall -y gptme
if ($LASTEXITCODE -eq 0) {
  Write-Output "gptme uninstalled successfully"
} else {
  Write-Error "Failed to uninstall gptme"
  exit 1
}
