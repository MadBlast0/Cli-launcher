Write-Output "Installing Fabric..."
go install github.com/danielmiessler/fabric@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Fabric installed successfully"
} else {
  Write-Error "Failed to install Fabric (Go toolchain required)"
  exit 1
}
