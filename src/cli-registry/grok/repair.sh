#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Grok CLI..."
npm uninstall -g @vibe-kit/grok-cli
npm install -g @vibe-kit/grok-cli
echo "Grok CLI repaired successfully"
