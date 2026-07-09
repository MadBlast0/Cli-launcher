Write-Output "Updating Mods..."
go install github.com/charmbracelet/mods@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Mods updated successfully"
} else {
  Write-Error "Failed to update Mods"
  exit 1
}
