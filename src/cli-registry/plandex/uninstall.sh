#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Plandex..."
rm -f "$(command -v plandex)" "$(command -v pdx)" 2>/dev/null || true
echo "Plandex uninstalled successfully"
