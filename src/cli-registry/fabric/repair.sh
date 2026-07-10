#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Fabric..."
go install github.com/danielmiessler/fabric/cmd/fabric@latest
echo "Fabric repaired successfully"
