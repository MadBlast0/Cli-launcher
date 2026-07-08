Write-Output "Installing @anthropic-ai/claude-code..."
npm install -g @anthropic-ai/claude-code
if ($LASTEXITCODE -eq 0) {
  Write-Output "Claude Code installed successfully"
} else {
  Write-Error "Failed to install Claude Code"
  exit 1
}
