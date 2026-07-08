Write-Output "Repairing @anthropic-ai/claude-code..."
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Claude Code repaired successfully"
} else {
  Write-Error "Failed to repair Claude Code"
  exit 1
}
