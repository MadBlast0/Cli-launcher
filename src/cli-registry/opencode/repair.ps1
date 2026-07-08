Write-Output "Repairing opencode-ai..."
npm uninstall -g opencode-ai
npm install -g opencode-ai
if ($LASTEXITCODE -eq 0) {
  Write-Output "opencode repaired successfully"
} else {
  Write-Error "Failed to repair opencode"
  exit 1
}
