#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Plandex..."
curl -sL https://plandex.ai/install.sh | bash
echo "Plandex repaired successfully"
