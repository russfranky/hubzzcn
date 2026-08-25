#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

SOURCE_DIR="$WORKDIR/source"
TARGET_DIR="$WORKDIR/target"
mkdir -p "$SOURCE_DIR/assets" "$TARGET_DIR/assets"

printf '%s\n' '<html>old</html>' > "$TARGET_DIR/index.html"
printf '%s\n' 'old asset' > "$TARGET_DIR/assets/old.js"
printf '%s\n' '<html>new</html>' > "$SOURCE_DIR/index.html"
printf '%s\n' 'new asset' > "$SOURCE_DIR/assets/new.js"
printf '%s\n' 'catalog metadata' > "$SOURCE_DIR/catalog.txt"

bash "$REPO_ROOT/scripts/publish-static.sh" "$SOURCE_DIR" "$TARGET_DIR"

cmp "$SOURCE_DIR/index.html" "$TARGET_DIR/index.html"
cmp "$SOURCE_DIR/assets/new.js" "$TARGET_DIR/assets/new.js"
cmp "$SOURCE_DIR/catalog.txt" "$TARGET_DIR/catalog.txt"
test -f "$TARGET_DIR/assets/old.js"

BAD_SOURCE="$WORKDIR/bad-source"
mkdir -p "$BAD_SOURCE/assets"
printf '%s\n' 'must not publish' > "$BAD_SOURCE/assets/bad.js"

if bash "$REPO_ROOT/scripts/publish-static.sh" "$BAD_SOURCE" "$TARGET_DIR"; then
  echo "Publisher accepted a source without index.html." >&2
  exit 1
fi

cmp "$SOURCE_DIR/index.html" "$TARGET_DIR/index.html"
test ! -e "$TARGET_DIR/assets/bad.js"

echo "Verified dependency-first static publish and atomic index replacement."
