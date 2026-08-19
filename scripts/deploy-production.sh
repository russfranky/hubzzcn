#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${HUBZZ_CN_ROOT:-/var/www/hubzz.xyz/cn}"

npm run build:preview

mkdir -p "$TARGET_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync --archive --delete dist/ "$TARGET_DIR/"
else
  find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
  cp -a dist/. "$TARGET_DIR/"
fi

echo "Deployed Hubzz UI to $TARGET_DIR"
