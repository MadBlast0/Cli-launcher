Write-Output "Uninstalling @anthropic-ai/claude-code..."
npm uninstall -g @anthropic-ai/claude-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Claude Code uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Claude Code"
  exit 1
}
