Write-Output "Updating Continue CLI..."
npm install -g @continuedev/cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Continue CLI updated successfully"
} else {
  Write-Error "Failed to update Continue CLI"
  exit 1
}
