#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Aider..."
pip uninstall -y aider-chat
pip install --upgrade aider-chat
echo "Aider repaired successfully"
