Write-Output "Uninstalling Fabric..."
Remove-Item -Force "$(go env GOPATH)\bin\fabric.exe" -ErrorAction SilentlyContinue
Write-Output "Fabric uninstalled successfully"
