#!/usr/bin/env bash
set -euo pipefail
echo "Updating Cursor Agent..."
cursor-agent update || curl https://cursor.com/install -fsS | bash
echo "Cursor Agent updated successfully"
