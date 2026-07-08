Add-Type -AssemblyName System.Windows.Forms
$saveFile = "$env:APPDATA\OpenCode\lastfolder.txt"
$browser = New-Object System.Windows.Forms.FolderBrowserDialog
$browser.Description = "Select or create a folder for opencode"
$browser.ShowNewFolderButton = $true
if (Test-Path $saveFile) {
    $browser.SelectedPath = (Get-Content $saveFile -Raw).Trim()
}
if ($browser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    $folder = $browser.SelectedPath
    $null = New-Item -ItemType Directory -Force -Path (Split-Path $saveFile)
    Set-Content -Path $saveFile -Value $folder -NoNewline
    Start-Process powershell -ArgumentList "-Command", "cd '$folder'; opencode --dangerously-skip-permissions"
}
