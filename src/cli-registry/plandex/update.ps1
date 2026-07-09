Write-Output "Updating Plandex via WSL..."
wsl -e bash -lc "curl -sL https://plandex.ai/install.sh | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Plandex updated successfully"
} else {
  Write-Error "Failed to update Plandex"
  exit 1
}
