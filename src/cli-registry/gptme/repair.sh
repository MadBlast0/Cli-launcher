#!/usr/bin/env bash
set -euo pipefail
echo "Repairing gptme..."
python -m pip uninstall -y gptme
python -m pip install --upgrade gptme
echo "gptme repaired successfully"
