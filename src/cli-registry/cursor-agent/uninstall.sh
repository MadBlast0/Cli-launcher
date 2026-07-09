#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Cursor Agent..."
rm -rf "$HOME/.local/bin/cursor-agent" "$HOME/.cursor-agent" 2>/dev/null || true
echo "Cursor Agent uninstalled successfully"
