#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Crush..."
npm uninstall -g @charmland/crush
npm install -g @charmland/crush
echo "Crush repaired successfully"
