#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${HUBZZ_CN_ROOT:-/var/www/hubzz.xyz/cn}"
LEGACY_DIR="${HUBZZ_CN_LEGACY_ROOT:-/var/www/hubzzhq.com/shadcn}"

mkdir -p "$TARGET_DIR"

# Preserve the deployment-only ticket artwork during the path migration.
if [[ ! -f "$TARGET_DIR/ticket-bg.jpg" && -f "$LEGACY_DIR/ticket-bg.jpg" ]]; then
  cp -a "$LEGACY_DIR/ticket-bg.jpg" "$TARGET_DIR/ticket-bg.jpg"
fi

npm run build:preview

# Replace hashed build assets, then overlay the new build.
# Non-build files already present in the production directory are preserved.
rm -rf "$TARGET_DIR/assets"
cp -a dist/. "$TARGET_DIR/"

echo "Deployed Hubzz UI to $TARGET_DIR"
