#!/usr/bin/env bash
set -euo pipefail
echo "Repairing Shell-GPT..."
python -m pip uninstall -y shell-gpt
python -m pip install --upgrade shell-gpt
echo "Shell-GPT repaired successfully"
