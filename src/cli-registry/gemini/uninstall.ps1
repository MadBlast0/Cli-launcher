Write-Output "Uninstalling @google/gemini-cli..."
npm uninstall -g @google/gemini-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Gemini CLI uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Gemini CLI"
  exit 1
}
