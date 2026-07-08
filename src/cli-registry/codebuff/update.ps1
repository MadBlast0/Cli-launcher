Write-Output "Updating codebuff..."
npm install -g codebuff@latest
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codebuff updated successfully"
} else {
  Write-Error "Failed to update Codebuff"
  exit 1
}
