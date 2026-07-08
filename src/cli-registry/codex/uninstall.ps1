Write-Output "Uninstalling @openai/codex..."
npm uninstall -g @openai/codex
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codex CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Codex CLI"
  exit 1
}
