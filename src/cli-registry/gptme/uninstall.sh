#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling gptme..."
python -m pip uninstall -y gptme
echo "gptme uninstalled successfully"
