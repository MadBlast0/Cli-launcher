#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Cline..."
npm uninstall -g cline
npm install -g cline
echo "Cline repaired successfully"
