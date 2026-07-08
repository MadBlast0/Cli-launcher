#!/usr/bin/env bash
set -euo pipefail
echo "Repairing GitHub Copilot CLI..."
npm uninstall -g @github/copilot
npm install -g @github/copilot
echo "GitHub Copilot CLI repaired successfully"
