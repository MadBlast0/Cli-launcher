Write-Output "Uninstalling Open Interpreter..."
python -m pip uninstall -y open-interpreter
if ($LASTEXITCODE -eq 0) {
  Write-Output "Open Interpreter uninstalled successfully"
} else {
  Write-Error "Failed to uninstall Open Interpreter"
  exit 1
}
