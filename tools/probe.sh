#!/usr/bin/env bash
# First thing to run on a new batch of source videos. Prints, per file:
# width,height,fps,duration,frame-count. Do this BEFORE extracting: the engine
# assumes a uniform frame count and fps across scenes, and you want to know now
# if one clip is 4.0s and another is 4.5s.
#
#   bash probe.sh *.mp4 "opening.png"
for f in "$@"; do
  printf "%-28s " "$f"
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of csv=p=0 "$f" 2>/dev/null || echo "(unreadable)"
done
