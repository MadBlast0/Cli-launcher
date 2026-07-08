Write-Output "Uninstalling codebuff..."
npm uninstall -g codebuff
if ($LASTEXITCODE -eq 0) {
  Write-Output "Codebuff uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Codebuff"
  exit 1
}
