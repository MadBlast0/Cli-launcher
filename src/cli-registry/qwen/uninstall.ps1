Write-Output "Uninstalling @qwen-code/qwen-code..."
npm uninstall -g @qwen-code/qwen-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Qwen Code uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Qwen Code"
  exit 1
}
