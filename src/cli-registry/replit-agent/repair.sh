#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Replit Agent..."
npm uninstall -g replit-agent
npm install -g replit-agent
echo "Replit Agent repaired successfully"
