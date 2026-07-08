Write-Output "Repairing Cursor CLI (reinstalling)..."
Invoke-RestMethod 'https://cursor.com/install?win32=true' | Invoke-Expression
if ($LASTEXITCODE -eq 0 -or $?) {
  Write-Output "Cursor CLI repaired successfully"
} else {
  Write-Error "Failed to repair Cursor CLI"
  exit 1
}
