Write-Output "Updating Cursor CLI..."
# Re-running the installer fetches and installs the latest build.
Invoke-RestMethod 'https://cursor.com/install?win32=true' | Invoke-Expression
if ($LASTEXITCODE -eq 0 -or $?) {
  Write-Output "Cursor CLI updated successfully"
} else {
  Write-Error "Failed to update Cursor CLI"
  exit 1
}
