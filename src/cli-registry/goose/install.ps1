try {
  Write-Output "Installing Goose CLI..."
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/block/goose/main/download_cli.ps1" -OutFile "$env:TEMP\download_cli.ps1"
  & "$env:TEMP\download_cli.ps1"
  if ($LASTEXITCODE -eq 0) { Write-Output "Goose CLI installed successfully" } else { Write-Error "Failed to install Goose CLI"; exit 1 }
} catch {
  Write-Error "Failed to install Goose CLI: $_"
  exit 1
}