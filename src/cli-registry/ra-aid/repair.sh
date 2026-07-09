#!/usr/bin/env bash
set -euo pipefail
echo "Repairing RA.Aid..."
pip uninstall -y ra-aid
pip install --upgrade ra-aid
echo "RA.Aid repaired successfully"
