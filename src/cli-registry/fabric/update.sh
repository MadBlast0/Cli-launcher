#!/usr/bin/env bash
set -euo pipefail
echo "Updating Fabric..."
go install github.com/danielmiessler/fabric/cmd/fabric@latest
echo "Fabric updated successfully"
