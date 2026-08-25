#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR=${1:?usage: publish-static.sh SOURCE_DIR TARGET_DIR}
TARGET_DIR=${2:?usage: publish-static.sh SOURCE_DIR TARGET_DIR}

if [[ ! -d "$SOURCE_DIR" || ! -f "$SOURCE_DIR/index.html" ]]; then
  echo "Static source must contain index.html: $SOURCE_DIR" >&2
  exit 1
fi

SOURCE_DIR=$(cd "$SOURCE_DIR" && pwd -P)
mkdir -p "$TARGET_DIR"
TARGET_DIR=$(cd "$TARGET_DIR" && pwd -P)

case "$TARGET_DIR/" in
  "$SOURCE_DIR/"*)
    echo "Target must not be inside source: $TARGET_DIR" >&2
    exit 1
    ;;
esac

case "$SOURCE_DIR/" in
  "$TARGET_DIR/"*)
    echo "Source must not be inside target: $SOURCE_DIR" >&2
    exit 1
    ;;
esac

# Publish every dependency before the HTML that references it. We intentionally
# do not delete old content-addressed assets here: an already-open page may
# still request them after the new index becomes current.
if command -v rsync >/dev/null 2>&1; then
  rsync --archive --exclude index.html "$SOURCE_DIR/" "$TARGET_DIR/"
else
  while IFS= read -r -d '' entry; do
    name=${entry##*/}
    [[ "$name" == "index.html" ]] && continue

    if [[ -d "$entry" ]]; then
      mkdir -p "$TARGET_DIR/$name"
      cp -a "$entry/." "$TARGET_DIR/$name/"
    else
      cp -a "$entry" "$TARGET_DIR/$name"
    fi
  done < <(find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -print0)
fi

index_temp=$(mktemp "$TARGET_DIR/.index.html.XXXXXX")
trap 'rm -f "$index_temp"' EXIT
cp "$SOURCE_DIR/index.html" "$index_temp"
chmod 0644 "$index_temp"
mv -f "$index_temp" "$TARGET_DIR/index.html"
trap - EXIT

echo "Published static site to $TARGET_DIR"
