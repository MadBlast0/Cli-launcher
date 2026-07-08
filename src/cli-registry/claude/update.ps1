Write-Output "Updating @anthropic-ai/claude-code..."
npm install -g @anthropic-ai/claude-code@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Claude Code updated successfully"
} else {
  Write-Error "Failed to update Claude Code"
  exit 1
}
