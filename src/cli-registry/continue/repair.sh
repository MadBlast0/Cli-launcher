#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Continue CLI..."
npm uninstall -g @continuedev/cli
npm install -g @continuedev/cli
echo "Continue CLI repaired successfully"
