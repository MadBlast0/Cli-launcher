Write-Output "Updating aichat..."
cargo install aichat --force
if ($LASTEXITCODE -eq 0) {
  Write-Output "aichat updated successfully"
} else {
  Write-Error "Failed to update aichat"
  exit 1
}
