#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Amp CLI..."
npm uninstall -g @ampcode/cli
npm install -g @ampcode/cli
echo "Amp CLI repaired successfully"
