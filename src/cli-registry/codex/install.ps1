Write-Output "Installing @openai/codex..."
npm install -g @openai/codex
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codex CLI installed successfully"
} else {
  Write-Error "Failed to install Codex CLI"
  exit 1
}
