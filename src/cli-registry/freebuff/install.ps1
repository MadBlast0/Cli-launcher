Write-Output "Installing freebuff..."
npm install -g freebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Freebuff installed successfully"
} else {
  Write-Error "Failed to install Freebuff"
  exit 1
}
