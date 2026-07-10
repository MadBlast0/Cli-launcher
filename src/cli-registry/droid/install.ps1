$ErrorActionPreference = 'Stop'
Write-Output "Installing Droid..."
try {
  irm https://app.factory.ai/cli/windows | iex
} catch {
  Write-Error "Failed to install Droid: $_"
  exit 1
}
Write-Output "Droid installed successfully"
