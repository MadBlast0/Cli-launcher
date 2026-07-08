Write-Output "Installing codebuff..."
npm install -g codebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codebuff installed successfully"
} else {
  Write-Error "Failed to install Codebuff"
  exit 1
}
