Write-Output "Updating Shell-GPT..."
python -m pip install --upgrade shell-gpt
if ($LASTEXITCODE -eq 0) {
  Write-Output "Shell-GPT updated successfully"
} else {
  Write-Error "Failed to update Shell-GPT"
  exit 1
}
