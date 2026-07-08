#!/usr/bin/env bash
set -euo pipefail
echo "Repairing PI Coding Agent..."
npm uninstall -g @mariozechner/pi-coding-agent
npm install -g @mariozechner/pi-coding-agent
echo "PI Coding Agent repaired successfully"
