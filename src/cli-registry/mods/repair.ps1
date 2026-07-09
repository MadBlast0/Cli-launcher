Write-Output "Repairing Mods..."
go install github.com/charmbracelet/mods@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Mods repaired successfully"
} else {
  Write-Error "Failed to repair Mods"
  exit 1
}
