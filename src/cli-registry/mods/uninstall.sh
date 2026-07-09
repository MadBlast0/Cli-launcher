#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Mods..."
rm -f "$(go env GOPATH)/bin/mods" 2>/dev/null || true
echo "Mods uninstalled successfully"
