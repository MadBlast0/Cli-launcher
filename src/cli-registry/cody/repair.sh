#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Cody CLI..."
npm uninstall -g @sourcegraph/cody
npm install -g @sourcegraph/cody
echo "Cody CLI repaired successfully"
