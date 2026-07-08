Write-Output "Updating @github/copilot..."
npm install -g @github/copilot@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "GitHub Copilot CLI updated successfully"
} else {
  Write-Error "Failed to update GitHub Copilot CLI"
  exit 1
}
