#!/usr/bin/env bash
set -euo pipefail
echo "Repairing OpenAI Codex CLI..."
npm uninstall -g @openai/codex
npm install -g @openai/codex
echo "OpenAI Codex CLI repaired successfully"
