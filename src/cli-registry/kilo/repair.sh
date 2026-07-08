#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Kilo Code..."
npm uninstall -g @kilocode/cli
npm install -g @kilocode/cli
echo "Kilo Code repaired successfully"
