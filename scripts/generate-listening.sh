#!/usr/bin/env sh
# Offline generation only. Requires FFmpeg with the Flite filter and libmp3lame.
# Run from repository root. No API, network, recording or paid model.
set -eu
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i 'flite=textfile=docs/content/library-evenings-v1.txt:voice=slt' \
  -ar 44100 -ac 1 -codec:a libmp3lame -b:a 96k \
  public/audio/library-evenings-v1.mp3
