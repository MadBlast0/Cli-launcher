Write-Output "Repairing codebuff..."
npm uninstall -g codebuff
npm install -g codebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codebuff repaired successfully"
} else {
  Write-Error "Failed to repair Codebuff"
  exit 1
}
