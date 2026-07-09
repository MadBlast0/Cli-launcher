#!/usr/bin/env bash
set -euo pipefail
echo "Installing Cursor Agent..."
curl https://cursor.com/install -fsS | bash
echo "Cursor Agent installed successfully"
