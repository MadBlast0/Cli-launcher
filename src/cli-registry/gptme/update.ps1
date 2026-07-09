Write-Output "Updating gptme..."
python -m pip install --upgrade gptme
if ($LASTEXITCODE -eq 0) {
  Write-Output "gptme updated successfully"
} else {
  Write-Error "Failed to update gptme"
  exit 1
}
