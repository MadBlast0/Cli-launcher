#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Open Interpreter..."
python -m pip uninstall -y open-interpreter
echo "Open Interpreter uninstalled successfully"
