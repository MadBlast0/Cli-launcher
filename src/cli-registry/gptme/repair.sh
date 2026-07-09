#!/usr/bin/env bash
set -euo pipefail
echo "Repairing gptme..."
pip uninstall -y gptme
pip install --upgrade gptme
echo "gptme repaired successfully"
