Write-Output "Repairing Plandex via WSL..."
wsl -e bash -lc "curl -sL https://plandex.ai/install.sh | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Plandex repaired successfully"
} else {
  Write-Error "Failed to repair Plandex"
  exit 1
}
