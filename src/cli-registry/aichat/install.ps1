Write-Output "Installing aichat..."
cargo install aichat
if ($LASTEXITCODE -eq 0) {
  Write-Output "aichat installed successfully"
} else {
  Write-Error "Failed to install aichat (Rust/cargo required)"
  exit 1
}
