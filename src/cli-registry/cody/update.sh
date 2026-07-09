#!/usr/bin/env bash
set -euo pipefail
echo "Updating Cody CLI..."
npm install -g @sourcegraph/cody@latest
echo "Cody CLI updated successfully"
