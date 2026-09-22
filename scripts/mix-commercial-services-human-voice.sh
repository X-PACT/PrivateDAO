#!/usr/bin/env bash
set -euo pipefail

VOICE="${1:?Usage: $0 HUMAN_VOICE_FILE [OUTPUT_FILE]}"
BASE="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="${2:-$BASE/PrivateDAO-flagship-film-2026-09-21-commercial-services-final.mp4}"
SILENT="$BASE/PrivateDAO-flagship-film-2026-09-21-commercial-services-v2-silent.mp4"
MUSIC="$BASE/commercial-mastered-stereo.flac"

test -s "$VOICE"
test -s "$SILENT"
test -s "$MUSIC"

ffmpeg -y -i "$SILENT" -i "$VOICE" -stream_loop -1 -i "$MUSIC" \
  -filter_complex "[1:a]highpass=f=80,lowpass=f=16000, loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=duration=180[n];[2:a]volume=0.12,atrim=duration=180[m];[n][m]amix=inputs=2:duration=longest:normalize=0[a]" \
  -map 0:v -map "[a]" -t 180 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart "$OUTPUT"

ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type,width,height,sample_rate,channels \
  -of default=noprint_wrappers=1 "$OUTPUT"
echo "Created: $OUTPUT"
