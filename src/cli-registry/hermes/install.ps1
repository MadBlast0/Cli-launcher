Write-Output "Installing Hermes Agent (CLI)..."
try {
  $script = Invoke-RestMethod -Uri "https://hermes-agent.nousresearch.com/install.ps1"
  Invoke-Expression $script
  Write-Output "Hermes Agent installed successfully"
} catch {
  Write-Error "Failed to install Hermes Agent: $_"
  exit 1
}
