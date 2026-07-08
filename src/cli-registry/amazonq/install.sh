#!/usr/bin/env bash
set -euo pipefail
echo "Installing Amazon Q Developer CLI..."
curl --proto '=https' --tlsv1.2 -sSf 'https://desktop-release.q.us-east-1.amazonaws.com/latest/q-x86_64-linux.zip' -o /tmp/q.zip
cd /tmp
unzip -o q.zip
./q/install.sh --no-confirm
echo "Amazon Q Developer CLI installed successfully"
