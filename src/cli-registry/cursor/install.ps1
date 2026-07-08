Write-Output "Installing Cursor CLI (native Windows)..."
# Official native-Windows installer. See https://cursor.com/docs/cli/installation
Invoke-RestMethod 'https://cursor.com/install?win32=true' | Invoke-Expression
if ($LASTEXITCODE -eq 0 -or $?) {
  Write-Output "Cursor CLI installed successfully"
} else {
  Write-Error "Failed to install Cursor CLI"
  exit 1
}
