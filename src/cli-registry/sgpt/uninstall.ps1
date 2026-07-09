Write-Output "Uninstalling Shell-GPT..."
python -m pip uninstall -y shell-gpt
if ($LASTEXITCODE -eq 0) {
  Write-Output "Shell-GPT uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Shell-GPT"
  exit 1
}
