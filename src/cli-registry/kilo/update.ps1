Write-Output "Updating @kilocode/cli..."
npm install -g @kilocode/cli@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Kilo CLI updated successfully"
} else {
  Write-Error "Failed to update Kilo CLI"
  exit 1
}
