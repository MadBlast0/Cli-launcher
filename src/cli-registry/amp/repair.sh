#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Amp CLI..."
npm uninstall -g @sourcegraph/amp
npm install -g @sourcegraph/amp
echo "Amp CLI repaired successfully"
