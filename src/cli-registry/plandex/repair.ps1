Write-Output "Repairing Plandex via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) { Write-Error "WSL is required. Install it with: wsl --install"; exit 1 }
wsl -e bash -lc "curl -fsSL https://plandex.ai/install.sh | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Plandex repaired successfully"
} else {
  Write-Error "Failed to repair Plandex"
  exit 1
}
