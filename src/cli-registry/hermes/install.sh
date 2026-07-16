#!/usr/bin/env bash
set -euo pipefail
echo "Installing Hermes Agent (CLI)..."
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
echo "Hermes Agent installed successfully"
