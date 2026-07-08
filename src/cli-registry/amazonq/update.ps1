Write-Output "Updating Amazon Q Developer CLI via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) {
  Write-Error "WSL is required. Install it with: wsl --install"
  exit 1
}
wsl -e bash -lc "q update"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amazon Q updated successfully"
} else {
  Write-Error "Failed to update Amazon Q"
  exit 1
}
