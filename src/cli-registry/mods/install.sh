#!/usr/bin/env bash
set -euo pipefail
echo "Installing Mods..."
go install github.com/charmbracelet/mods@latest
echo "Mods installed successfully"
