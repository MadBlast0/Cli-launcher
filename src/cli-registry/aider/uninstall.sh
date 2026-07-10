#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Aider..."
python -m pip uninstall -y aider-chat
echo "Aider uninstalled successfully"
