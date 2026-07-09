#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Droid..."
curl -fsSL https://app.factory.ai/cli | sh
echo "Droid repaired successfully"
