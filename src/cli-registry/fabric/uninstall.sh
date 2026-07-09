#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Fabric..."
rm -f "$(go env GOPATH)/bin/fabric" 2>/dev/null || true
echo "Fabric uninstalled successfully"
