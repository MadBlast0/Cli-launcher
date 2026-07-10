try {
  Write-Output "Updating Goose CLI..."
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/block/goose/main/download_cli.ps1" -OutFile "$env:TEMP\download_cli.ps1"
  & "$env:TEMP\download_cli.ps1"
  if ($LASTEXITCODE -eq 0) { Write-Output "Goose CLI updated successfully" } else { Write-Error "Failed to update Goose CLI"; exit 1 }
} catch {
  Write-Error "Failed to update Goose CLI: $_"
  exit 1
}