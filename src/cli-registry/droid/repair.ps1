$ErrorActionPreference = 'Stop'
Write-Output "Repairing Droid..."
try {
  irm https://app.factory.ai/cli/windows | iex
} catch {
  Write-Error "Failed to repair Droid: $_"
  exit 1
}
Write-Output "Droid repaired successfully"
