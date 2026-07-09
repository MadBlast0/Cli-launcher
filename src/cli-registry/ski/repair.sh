#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Ski CLI..."
npm uninstall -g ski-cli
npm install -g ski-cli
echo "Ski CLI repaired successfully"
