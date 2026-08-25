#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TARGET_DIR="${HUBZZ_CN_ROOT:-/var/www/hubzz.xyz/cn}"

cd "$REPO_ROOT"
pnpm build:preview
bash "$REPO_ROOT/scripts/publish-static.sh" "$REPO_ROOT/dist" "$TARGET_DIR"

echo "Deployed Hubzz UI to $TARGET_DIR"
