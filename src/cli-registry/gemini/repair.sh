#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Gemini CLI..."
npm uninstall -g @google/gemini-cli
npm install -g @google/gemini-cli
echo "Gemini CLI repaired successfully"
