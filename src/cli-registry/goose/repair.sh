#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Goose CLI..."
npm uninstall -g @block/goose
npm install -g @block/goose
echo "Goose CLI repaired successfully"
