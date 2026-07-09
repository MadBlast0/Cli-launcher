Write-Output "Installing Shell-GPT..."
python -m pip install --upgrade shell-gpt
if ($LASTEXITCODE -eq 0) {
  Write-Output "Shell-GPT installed successfully"
} else {
  Write-Error "Failed to install Shell-GPT"
  exit 1
}
