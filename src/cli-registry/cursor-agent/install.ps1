Write-Output "Installing Cursor Agent via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) { Write-Error "WSL is required. Install it with: wsl --install"; exit 1 }
wsl -e bash -lc "curl https://cursor.com/install -fsS | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cursor Agent installed successfully"
} else {
  Write-Error "Failed to install Cursor Agent"
  exit 1
}
