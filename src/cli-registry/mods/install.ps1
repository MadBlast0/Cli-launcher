Write-Output "Installing Mods..."
go install github.com/charmbracelet/mods@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Mods installed successfully"
} else {
  Write-Error "Failed to install Mods (Go toolchain required)"
  exit 1
}
