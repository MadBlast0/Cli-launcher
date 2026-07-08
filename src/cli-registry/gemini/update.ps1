Write-Output "Updating @google/gemini-cli..."
npm install -g @google/gemini-cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Gemini CLI updated successfully"
} else {
  Write-Error "Failed to update Gemini CLI"
  exit 1
}
