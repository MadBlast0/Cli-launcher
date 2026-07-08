Write-Output "Updating @qwen-code/qwen-code..."
npm install -g @qwen-code/qwen-code@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Qwen Code updated successfully"
} else {
  Write-Error "Failed to update Qwen Code"
  exit 1
}
