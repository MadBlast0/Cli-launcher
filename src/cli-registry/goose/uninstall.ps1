Write-Output "Uninstalling Goose CLI..."
Remove-Item "$env:USERPROFILE\.local\bin\goose*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.config\goose" -Recurse -Force -ErrorAction SilentlyContinue
Write-Output "Goose CLI uninstalled"