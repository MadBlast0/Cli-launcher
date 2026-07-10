#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Open Interpreter..."
python -m pip uninstall -y open-interpreter
python -m pip install --upgrade open-interpreter
echo "Open Interpreter repaired successfully"
