Write-Output "Goose CLI: installing via npm..."
npm install -g @block/goose
if ($LASTEXITCODE -eq 0) {
  Write-Output "Goose CLI installed successfully"
} else {
  Write-Error "Failed to install Goose CLI"
  exit 1
}
