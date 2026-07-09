Write-Output "Updating Fabric..."
go install github.com/danielmiessler/fabric@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Fabric updated successfully"
} else {
  Write-Error "Failed to update Fabric"
  exit 1
}
