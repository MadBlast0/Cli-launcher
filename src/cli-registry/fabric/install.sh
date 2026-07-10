#!/usr/bin/env bash
set -euo pipefail
echo "Installing Fabric..."
go install github.com/danielmiessler/fabric/cmd/fabric@latest
echo "Fabric installed successfully"
