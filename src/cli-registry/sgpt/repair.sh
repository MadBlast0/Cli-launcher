#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Shell-GPT..."
pip uninstall -y shell-gpt
pip install --upgrade shell-gpt
echo "Shell-GPT repaired successfully"
