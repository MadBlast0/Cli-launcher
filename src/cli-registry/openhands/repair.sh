#!/usr/bin/env bash
set -euo pipefail
echo "Repairing OpenHands CLI..."
pip uninstall -y openhands-ai
pip install --upgrade openhands-ai
echo "OpenHands CLI repaired successfully"
