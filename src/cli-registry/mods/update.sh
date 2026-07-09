#!/usr/bin/env bash
set -euo pipefail
echo "Updating Mods..."
go install github.com/charmbracelet/mods@latest
echo "Mods updated successfully"
