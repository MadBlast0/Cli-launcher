#!/usr/bin/env bash
set -euo pipefail
echo "Repairing OpenCode..."
npm uninstall -g opencode-ai
npm install -g opencode-ai
echo "OpenCode repaired successfully"
