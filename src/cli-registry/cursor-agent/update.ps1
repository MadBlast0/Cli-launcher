Write-Output "Updating Cursor Agent via WSL..."
wsl -e bash -lc "cursor-agent update || curl https://cursor.com/install -fsS | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cursor Agent updated successfully"
} else {
  Write-Error "Failed to update Cursor Agent"
  exit 1
}
