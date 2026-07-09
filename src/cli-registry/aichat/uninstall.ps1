Write-Output "Uninstalling aichat..."
cargo uninstall aichat
if ($LASTEXITCODE -eq 0) {
  Write-Output "aichat uninstalled successfully"
} else {
  Write-Error "Failed to uninstall aichat"
  exit 1
}
