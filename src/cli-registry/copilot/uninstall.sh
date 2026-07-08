#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling GitHub Copilot CLI..."
npm uninstall -g @github/copilot
echo "GitHub Copilot CLI uninstalled successfully"
