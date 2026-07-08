Write-Output "Installing @google/gemini-cli..."
npm install -g @google/gemini-cli
if ($LASTEXITCODE -eq 0) {
  Write-Output "Gemini CLI installed successfully"
} else {
  Write-Error "Failed to install Gemini CLI"
  exit 1
}
