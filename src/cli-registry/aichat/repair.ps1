Write-Output "Repairing aichat..."
cargo install aichat --force
if ($LASTEXITCODE -eq 0) {
  Write-Output "aichat repaired successfully"
} else {
  Write-Error "Failed to repair aichat"
  exit 1
}
