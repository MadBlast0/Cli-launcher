Write-Output "Repairing Amazon Q Developer CLI via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) {
  Write-Error "WSL is required. Install it with: wsl --install"
  exit 1
}
wsl -e bash -lc "curl --proto '=https' --tlsv1.2 -sSf 'https://desktop-release.q.us-east-1.amazonaws.com/latest/q-x86_64-linux.zip' -o /tmp/q.zip && cd /tmp && unzip -o q.zip && ./q/install.sh --no-confirm"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Amazon Q repaired successfully"
} else {
  Write-Error "Failed to repair Amazon Q"
  exit 1
}
