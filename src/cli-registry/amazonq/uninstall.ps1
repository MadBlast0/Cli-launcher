Write-Output "Uninstalling Amazon Q Developer CLI via WSL..."
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wsl) {
  Write-Error "WSL is required. Install it with: wsl --install"
  exit 1
}
wsl -e bash -lc "q uninstall --no-confirm || rm -rf ~/.local/bin/q ~/.local/share/amazon-q"
Write-Output "Amazon Q uninstalled"
