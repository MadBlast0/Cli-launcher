# CLI Launcher — one-line installer for Windows.
#   powershell -ExecutionPolicy Bypass -c "irm https://cli-launcher.veyl.in/install.ps1 | iex"
#
# Downloads the latest GitHub release Windows installer (.msi preferred) and
# runs it. No other system changes are made by this script.
$ErrorActionPreference = "Stop"

$Repo   = "MadBlast0/Cli-launcher"
$Api    = "https://api.github.com/repos/$Repo/releases/latest"
$Dest   = Join-Path $env:USERPROFILE "Downloads"

Write-Host "==> CLI Launcher installer"

Write-Host "==> Fetching latest release metadata…"
$release = Invoke-RestMethod -Uri $Api -Headers @{ "User-Agent" = "cli-launcher-installer" }

$asset = $release.assets |
  Where-Object { $_.name.ToLower().EndsWith('.msi') } |
  Select-Object -First 1

if (-not $asset) {
  $asset = $release.assets |
    Where-Object { $_.name.ToLower().EndsWith('.exe') -and ($_.name.ToLower() -notmatch 'portable') } |
    Select-Object -First 1
}

if (-not $asset) {
  Write-Error "No Windows installer found. Visit https://github.com/$Repo/releases"
  exit 1
}

$out = Join-Path $Dest $asset.name
Write-Host "==> Downloading $($asset.name)…"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $out

Write-Host "==> Running installer…"
Start-Process -FilePath $out -ArgumentList "/passive" -Wait

Write-Host "==> Done. Installed from $out"
