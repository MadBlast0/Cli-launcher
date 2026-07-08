#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Qwen Code..."
npm uninstall -g @qwen-code/qwen-code
npm install -g @qwen-code/qwen-code
echo "Qwen Code repaired successfully"
