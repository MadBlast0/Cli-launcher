Write-Output "Uninstalling Droid..."
Remove-Item -Recurse -Force "$env:USERPROFILE\.factory" -ErrorAction SilentlyContinue
Write-Output "Droid uninstalled successfully"
