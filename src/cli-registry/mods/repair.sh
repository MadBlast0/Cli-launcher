#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Mods..."
go install github.com/charmbracelet/mods@latest
echo "Mods repaired successfully"
