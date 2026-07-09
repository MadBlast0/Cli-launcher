#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Cursor Agent..."
curl https://cursor.com/install -fsS | bash
echo "Cursor Agent repaired successfully"
