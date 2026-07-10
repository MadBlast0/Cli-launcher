#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Goose CLI..."
rm -rf "$HOME/.local/bin/goose" "$HOME/.config/goose" 2>/dev/null || true
echo "Goose CLI uninstalled"