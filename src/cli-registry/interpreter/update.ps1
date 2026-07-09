Write-Output "Updating Open Interpreter..."
python -m pip install --upgrade open-interpreter
if ($LASTEXITCODE -eq 0) {
  Write-Output "Open Interpreter updated successfully"
} else {
  Write-Error "Failed to update Open Interpreter"
  exit 1
}
