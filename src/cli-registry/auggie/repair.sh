#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Auggie..."
npm uninstall -g @augmentcode/auggie
npm install -g @augmentcode/auggie
echo "Auggie repaired successfully"
