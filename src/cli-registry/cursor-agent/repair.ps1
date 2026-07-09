Write-Output "Repairing Cursor Agent via WSL..."
wsl -e bash -lc "curl https://cursor.com/install -fsS | bash"
if ($LASTEXITCODE -eq 0) {
  Write-Output "Cursor Agent repaired successfully"
} else {
  Write-Error "Failed to repair Cursor Agent"
  exit 1
}
