#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Open Interpreter..."
pip uninstall -y open-interpreter
pip install --upgrade open-interpreter
echo "Open Interpreter repaired successfully"
