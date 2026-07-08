Write-Output "Updating @openai/codex..."
npm install -g @openai/codex@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codex CLI updated successfully"
} else {
  Write-Error "Failed to update Codex CLI"
  exit 1
}
