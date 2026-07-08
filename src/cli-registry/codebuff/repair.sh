#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Codebuff..."
npm uninstall -g codebuff
npm install -g codebuff
echo "Codebuff repaired successfully"
