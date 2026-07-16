#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Oh My Pi..."
npm uninstall -g @oh-my-pi/pi-coding-agent
npm install -g @oh-my-pi/pi-coding-agent
echo "Oh My Pi repaired successfully"
