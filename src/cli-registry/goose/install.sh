#!/usr/bin/env bash
set -euo pipefail
echo "Installing Goose CLI..."
curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash
echo "Goose CLI installed successfully"