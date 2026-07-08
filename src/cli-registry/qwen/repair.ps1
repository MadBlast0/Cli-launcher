Write-Output "Repairing @qwen-code/qwen-code..."
npm uninstall -g @qwen-code/qwen-code
npm install -g @qwen-code/qwen-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Qwen Code repaired successfully"
} else {
  Write-Error "Failed to repair Qwen Code"
  exit 1
}
