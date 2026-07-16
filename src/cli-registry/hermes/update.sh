#!/usr/bin/env bash
set -euo pipefail
echo "Updating Hermes Agent..."
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
echo "Hermes Agent updated successfully"
