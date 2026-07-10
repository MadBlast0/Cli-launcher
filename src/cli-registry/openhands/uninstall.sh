#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling OpenHands CLI..."
python -m pip uninstall -y openhands-ai
echo "OpenHands CLI uninstalled successfully"
