#!/usr/bin/env bash
#
# CLI Launcher — one-line installer for macOS and Linux.
#   curl -fsSL https://cli-launcher.veyl.in/install.sh | sh
#
# Downloads the latest GitHub release asset for the current platform and
# opens / launches it. No system-wide changes are made by this script beyond
# downloading the installer into ~/Downloads.
set -euo pipefail

REPO="MadBlast0/Cli-launcher"
API="https://api.github.com/repos/${REPO}/releases/latest"
DEST="${HOME}/Downloads"

OS="$(uname -s)"
ARCH="$(uname -m)"

echo "==> CLI Launcher installer — detected ${OS} / ${ARCH}"

echo "==> Fetching latest release metadata…"
if ! command -v curl >/dev/null 2>&1; then
  echo "!! 'curl' is required but was not found." >&2
  exit 1
fi
JSON="$(curl -fsSL "$API")"

echo "==> Resolving the best asset for this platform…"
URL="$(printf '%s' "$JSON" | python3 - "$OS" "$ARCH" <<'PY'
import sys, json
osname, arch = sys.argv[1], sys.argv[2]
data = json.load(sys.stdin)
assets = data.get('assets', [])
def find(pred):
    return next((a['browser_download_url'] for a in assets if pred(a['name'].lower())), None)
if osname == 'Darwin':
    u = find(lambda n: n.endswith('.dmg') and 'universal' in n) \
      or find(lambda n: n.endswith('.dmg'))
elif osname == 'Linux':
    u = (find(lambda n: n.endswith('.appimage'))
         or find(lambda n: n.endswith('.deb'))
         or find(lambda n: n.endswith('.rpm'))
         or find(lambda n: n.endswith('.tar.gz')))
else:
    u = None
print(u or '')
PY
)"

if [ -z "$URL" ]; then
  echo "!! No matching release asset for ${OS}. Visit https://github.com/${REPO}/releases" >&2
  exit 1
fi

FILENAME="$(basename "$URL")"
OUT="${DEST}/${FILENAME}"

echo "==> Downloading ${FILENAME}…"
curl -fL "$URL" -o "$OUT"

if [ "$OS" = "Darwin" ]; then
  echo "==> Opening ${OUT} — mount the DMG and drag CLI Launcher to Applications."
  open "$OUT"
elif [ "$OS" = "Linux" ]; then
  if [[ "$FILENAME" == *.AppImage ]]; then
    chmod +x "$OUT"
    echo "==> Launching ${OUT}"
    nohup "$OUT" >/dev/null 2>&1 &
  else
    echo "==> Opening ${OUT}"
    xdg-open "$OUT" >/dev/null 2>&1 || true
  fi
fi

echo "==> Done. Installer saved to ${OUT}"
