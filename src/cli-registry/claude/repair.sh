#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Claude Code..."
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
echo "Claude Code repaired successfully"
