#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Freebuff..."
npm uninstall -g freebuff
npm install -g freebuff
echo "Freebuff repaired successfully"
