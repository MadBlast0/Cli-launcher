Write-Output "Installing Open Interpreter..."
python -m pip install --upgrade open-interpreter
if ($LASTEXITCODE -eq 0) {
  Write-Output "Open Interpreter installed successfully"
} else {
  Write-Error "Failed to install Open Interpreter"
  exit 1
}
