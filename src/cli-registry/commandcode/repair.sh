#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Command Code..."
npm uninstall -g command-code
npm install -g command-code
echo "Command Code repaired successfully"
