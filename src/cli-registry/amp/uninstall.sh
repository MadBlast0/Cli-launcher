#!/usr/bin/env bash
set -euo pipefail
echo "Uninstalling Amp CLI..."
npm uninstall -g @sourcegraph/amp
echo "Amp CLI uninstalled successfully"
