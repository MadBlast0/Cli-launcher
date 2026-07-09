#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Droid..."
rm -rf "$HOME/.factory/bin/droid" 2>/dev/null || true
echo "Droid uninstalled successfully"
