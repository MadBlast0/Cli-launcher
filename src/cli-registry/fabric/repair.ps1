Write-Output "Repairing Fabric..."
go install github.com/danielmiessler/fabric@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Fabric repaired successfully"
} else {
  Write-Error "Failed to repair Fabric"
  exit 1
}
