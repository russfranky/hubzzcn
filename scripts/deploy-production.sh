#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${HUBZZ_SHADCN_ROOT:-/var/www/hubzzhq.com/shadcn}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Production directory not found: $TARGET_DIR" >&2
  exit 1
fi

npm run build:preview

# Replace hashed build assets, then overlay the new build.
# Non-build files already present in the production directory are preserved.
rm -rf "$TARGET_DIR/assets"
cp -a dist/. "$TARGET_DIR/"

echo "Deployed Hubzz UI to $TARGET_DIR"
