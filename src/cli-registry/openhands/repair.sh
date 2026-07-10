#!/usr/bin/env bash
set -euo pipefail
echo "Repairing OpenHands CLI..."
python -m pip uninstall -y openhands-ai
python -m pip install --upgrade openhands-ai
echo "OpenHands CLI repaired successfully"
