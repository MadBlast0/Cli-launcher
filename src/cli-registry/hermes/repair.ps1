Write-Output "Repairing Hermes Agent..."
try {
  $script = Invoke-RestMethod -Uri "https://hermes-agent.nousresearch.com/install.ps1"
  Invoke-Expression $script
  Write-Output "Hermes Agent repaired successfully"
} catch {
  Write-Error "Failed to repair Hermes Agent: $_"
  exit 1
}
