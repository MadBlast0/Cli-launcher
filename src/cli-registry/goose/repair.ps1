try {
  Write-Output "Repairing Goose CLI..."
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/block/goose/main/download_cli.ps1" -OutFile "$env:TEMP\download_cli.ps1"
  & "$env:TEMP\download_cli.ps1"
  if ($LASTEXITCODE -eq 0) { Write-Output "Goose CLI repaired successfully" } else { Write-Error "Failed to repair Goose CLI"; exit 1 }
} catch {
  Write-Error "Failed to repair Goose CLI: $_"
  exit 1
}