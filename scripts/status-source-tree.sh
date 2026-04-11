#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/home/x-pact/PrivateDAO"

git -C "$REPO_ROOT" status --short -- \
  .github \
  apps \
  docs \
  frontend \
  migrations \
  programs \
  scripts \
  sdk \
  tests \
  README.md \
  Anchor.toml \
  Cargo.toml \
  Cargo.lock \
  package.json \
  package-lock.json \
  tsconfig.json \
  ':(exclude)docs/assets/weekly-live-captures' \
  ':(exclude)docs/assets/weekly-updates/private-dao-week-1-update.mp4' \
  ':(exclude)docs/assets/weekly-updates-live' \
  ':(exclude)docs/assets/weekly-youtube-ready' \
  ':(exclude)docs/index.html' \
  ':(exclude)docs/assets/weekly-updates/week-1-scene-1.png' \
  ':(exclude)docs/assets/weekly-updates/week-1-scene-2.png' \
  ':(exclude)docs/assets/weekly-updates/week-1-scene-3.png' \
  ':(exclude)docs/assets/weekly-updates/week-1-scene-4.png' \
  ':(exclude)docs/assets/weekly-updates/week-1-scene-5.png'
