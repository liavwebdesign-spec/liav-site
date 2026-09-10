#!/usr/bin/env bash
# Extract image sequences from source videos, in the three tiers the engine expects.
#
#   bash build-frames.sh [--opening "opening.png"] [--out site] [--fps 24] 1.mp4 2.mp4 ... N.mp4
#
# Produces, under --out (default ./site):
#   frames/<n>/001.jpg..      full quality 1280x720, q3   (~70KB/frame)   what desktop settles on
#   frames-lo/<n>/001.jpg..   proxy 640x360, q9           (~14KB/frame)   loads first; phones in landscape / tablets
#   frames-pt/<n>/001.jpg..   portrait 9:16 crop 405x720  (~18KB/frame)   phones in portrait
#   opening.jpg / opening-pt.jpg
#
# Why three tiers: the proxy makes scrubbing usable within seconds on any connection,
# and the portrait crop exists because a 16:9 frame cover-fitted into a phone shows
# ~26% of its width while upscaling the proxy 2.3x. Same bytes, twice the sharpness.
#
# Also prints the frame count per scene: the engine assumes every scene has the same
# count. If they differ, either trim the videos or set CONFIG.frames per scene.
set -euo pipefail

OPENING=""; OUT="site"; FPS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --opening) OPENING="$2"; shift 2;;
    --out) OUT="$2"; shift 2;;
    --fps) FPS="$2"; shift 2;;
    *) break;;
  esac
done
[[ $# -gt 0 ]] || { echo "usage: build-frames.sh [--opening img] [--out dir] video1 video2 ..."; exit 1; }

command -v ffmpeg >/dev/null || { echo "ffmpeg not on PATH"; exit 1; }
FPSF=""; [[ -n "$FPS" ]] && FPSF=",fps=$FPS"

n=0
for v in "$@"; do
  n=$((n+1))
  echo "scene $n  <- $v"
  mkdir -p "$OUT/frames/$n" "$OUT/frames-lo/$n" "$OUT/frames-pt/$n"
  ffmpeg -v error -y -i "$v" -vf "scale=1280:720$FPSF"          -q:v 3 "$OUT/frames/$n/%03d.jpg"
  ffmpeg -v error -y -i "$v" -vf "scale=640:360$FPSF"           -q:v 9 "$OUT/frames-lo/$n/%03d.jpg"
  # centre crop; the 437 offset = (1280-405)/2. Change per scene if a subject sits off-centre.
  ffmpeg -v error -y -i "$v" -vf "scale=1280:720$FPSF,crop=405:720:437:0" -q:v 9 "$OUT/frames-pt/$n/%03d.jpg"
  echo "   frames: $(ls "$OUT/frames/$n" | wc -l)"
done

if [[ -n "$OPENING" ]]; then
  ffmpeg -v error -y -i "$OPENING" -vf "scale=1920:-1" -q:v 3 "$OUT/opening.jpg"
  ffmpeg -v error -y -i "$OPENING" -vf "scale=-1:1520,crop=855:1520:(iw-855)/2:0" -q:v 6 "$OUT/opening-pt.jpg"
  echo "opening: $OUT/opening.jpg + opening-pt.jpg"
fi

echo
echo "scenes: $n"
echo "full   : $(du -sm "$OUT/frames"    | cut -f1)MB"
echo "proxy  : $(du -sm "$OUT/frames-lo" | cut -f1)MB"
echo "portrait: $(du -sm "$OUT/frames-pt" | cut -f1)MB"
echo "-> set CONFIG.scenes=$n and CONFIG.frames=<count above> in the template"
