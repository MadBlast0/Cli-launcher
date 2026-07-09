#!/usr/bin/env bash
set -euo pipefail
echo "Updating Plandex..."
curl -sL https://plandex.ai/install.sh | bash
echo "Plandex updated successfully"
