#!/usr/bin/env bash
set -euo pipefail
echo "Repairing RA.Aid..."
python -m pip uninstall -y ra-aid
python -m pip install --upgrade ra-aid
echo "RA.Aid repaired successfully"
