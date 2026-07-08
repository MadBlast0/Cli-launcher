Write-Output "Repairing @google/gemini-cli..."
npm uninstall -g @google/gemini-cli
npm install -g @google/gemini-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Gemini CLI repaired successfully"
} else {
  Write-Error "Failed to repair Gemini CLI"
  exit 1
}
