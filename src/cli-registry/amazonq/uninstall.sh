#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Amazon Q Developer CLI..."
q uninstall --no-confirm || rm -rf "$HOME/.local/bin/q" "$HOME/.local/share/amazon-q"
echo "Amazon Q Developer CLI uninstalled"
