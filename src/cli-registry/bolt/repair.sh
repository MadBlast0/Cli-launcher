#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Bolt CLI..."
npm uninstall -g @bolt/cli
npm install -g @bolt/cli
echo "Bolt CLI repaired successfully"
