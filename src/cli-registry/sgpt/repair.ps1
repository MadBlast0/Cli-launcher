Write-Output "Repairing Shell-GPT..."
python -m pip uninstall -y shell-gpt
python -m pip install --upgrade shell-gpt
if ($LASTEXITCODE -eq 0) {
  Write-Output "Shell-GPT repaired successfully"
} else {
  Write-Error "Failed to repair Shell-GPT"
  exit 1
}
