#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Hermes Agent..."
python -m pip uninstall -y hermes-agent
echo "Hermes Agent uninstalled successfully"
