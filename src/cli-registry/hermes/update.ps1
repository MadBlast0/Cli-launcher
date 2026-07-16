Write-Output "Updating Hermes Agent..."
try {
  $script = Invoke-RestMethod -Uri "https://hermes-agent.nousresearch.com/install.ps1"
  Invoke-Expression $script
  Write-Output "Hermes Agent updated successfully"
} catch {
  Write-Error "Failed to update Hermes Agent: $_"
  exit 1
}
