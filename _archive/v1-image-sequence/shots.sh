#!/usr/bin/env bash
# QA screenshots with headless Chrome. usage: bash tools/shots.sh [W H] at1 at2 ...
# Writes tools/shots/<W>x<H>-<at>.png. Needs the preview server on :5173.
set -e
cd "$(dirname "$0")/.."
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=1280; H=720
if [[ "$1" == "--size" ]]; then W=$2; H=$3; shift 3; fi
mkdir -p tools/shots
for at in "$@"; do
  out="tools/shots/${W}x${H}-${at}.png"
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=$W,$H --virtual-time-budget=16000 \
    --screenshot="$(cygpath -w "$PWD/$out")" "http://localhost:5173/?at=$at" >/dev/null 2>&1
  echo "$out"
done
