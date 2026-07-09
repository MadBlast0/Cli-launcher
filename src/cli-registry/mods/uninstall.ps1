Write-Output "Uninstalling Mods..."
Remove-Item -Force "$(go env GOPATH)\bin\mods.exe" -ErrorAction SilentlyContinue
Write-Output "Mods uninstalled successfully"
