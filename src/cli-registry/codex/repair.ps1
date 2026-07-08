Write-Output "Repairing @openai/codex..."
npm uninstall -g @openai/codex
npm install -g @openai/codex
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codex CLI repaired successfully"
} else {
  Write-Error "Failed to repair Codex CLI"
  exit 1
}
