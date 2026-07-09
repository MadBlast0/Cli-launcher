#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Cody CLI..."
npm uninstall -g @sourcegraph/cody
echo "Cody CLI uninstalled successfully"
