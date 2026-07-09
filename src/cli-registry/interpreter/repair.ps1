Write-Output "Repairing Open Interpreter..."
python -m pip uninstall -y open-interpreter
python -m pip install --upgrade open-interpreter
if ($LASTEXITCODE -eq 0) {
  Write-Output "Open Interpreter repaired successfully"
} else {
  Write-Error "Failed to repair Open Interpreter"
  exit 1
}
