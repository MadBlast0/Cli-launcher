Write-Output "Installing @qwen-code/qwen-code..."
npm install -g @qwen-code/qwen-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Qwen Code installed successfully"
} else {
  Write-Error "Failed to install Qwen Code"
  exit 1
}
