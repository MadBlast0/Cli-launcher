#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Cursor CLI..."
BIN=$(command -v agent 2>/dev/null || true)
if [ -n "$BIN" ]; then
  rm -rf "$BIN"
  echo "Removed $BIN"
fi
rm -f "$HOME/.local/bin/cursor-agent" 2>/dev/null || true
rm -rf "$HOME/.cursor" 2>/dev/null || true
echo "Cursor CLI uninstalled"
