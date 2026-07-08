#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Cursor CLI..."
BIN=$(which cursor-agent 2>/dev/null || true)
if [ -n "$BIN" ]; then
  DIR=$(dirname "$BIN")
  echo "Removing $DIR"
  rm -rf "$DIR"
fi
for dir in "$HOME/.local/bin/cursor-agent" "$HOME/.cursor"; do
  [ -d "$dir" ] && rm -rf "$dir"
done
echo "Cursor CLI uninstalled"
