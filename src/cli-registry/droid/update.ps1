$ErrorActionPreference = 'Stop'
Write-Output "Updating Droid..."
try {
  irm https://app.factory.ai/cli/windows | iex
} catch {
  Write-Error "Failed to update Droid: $_"
  exit 1
}
Write-Output "Droid updated successfully"
