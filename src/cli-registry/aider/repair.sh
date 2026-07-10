#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Aider..."
python -m pip uninstall -y aider-chat
python -m pip install --upgrade aider-chat
echo "Aider repaired successfully"
