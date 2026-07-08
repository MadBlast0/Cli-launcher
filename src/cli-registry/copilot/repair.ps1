Write-Output "Repairing @github/copilot..."
npm uninstall -g @github/copilot
npm install -g @github/copilot
if ($LASTEXITCODE -eq 0) {
  Write-Output "GitHub Copilot CLI repaired successfully"
} else {
  Write-Error "Failed to repair GitHub Copilot CLI"
  exit 1
}
