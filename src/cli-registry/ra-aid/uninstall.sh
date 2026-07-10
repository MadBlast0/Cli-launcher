#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling RA.Aid..."
python -m pip uninstall -y ra-aid
echo "RA.Aid uninstalled successfully"
