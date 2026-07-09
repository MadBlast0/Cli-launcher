Write-Output "Installing gptme..."
python -m pip install --upgrade gptme
if ($LASTEXITCODE -eq 0) {
  Write-Output "gptme installed successfully"
} else {
  Write-Error "Failed to install gptme"
  exit 1
}
