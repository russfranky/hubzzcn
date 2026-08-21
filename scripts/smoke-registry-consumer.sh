#!/usr/bin/env bash
set -euo pipefail

REF="${1:-${GITHUB_SHA:-main}}"
REGISTRY_ADDRESS="russfranky/hubzzcn"
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SHADCN="${REPO_ROOT}/node_modules/.bin/shadcn"
TSX="${REPO_ROOT}/node_modules/.bin/tsx"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

if [[ ! -x "$SHADCN" || ! -x "$TSX" ]]; then
  echo "Locked shadcn/tsx tooling is unavailable. Run pnpm install --frozen-lockfile first." >&2
  exit 1
fi

ITEMS_FILE="${WORKDIR}/registry-items"
INTERNAL_DEPS_FILE="${WORKDIR}/registry-internal-dependencies"
"$TSX" "${REPO_ROOT}/scripts/list-registry-items.ts" > "$ITEMS_FILE"
"$TSX" "${REPO_ROOT}/scripts/list-registry-items.ts" \
  --internal-dependencies "$REGISTRY_ADDRESS" > "$INTERNAL_DEPS_FILE"

cd "$WORKDIR"
"$SHADCN" init \
  --template vite \
  --base radix \
  --preset nova \
  --name consumer \
  --yes \
  --no-monorepo \
  --silent

cd consumer

while IFS= read -r item; do
  echo "Installing ${item} at ${REF}"
  "$SHADCN" add "${REGISTRY_ADDRESS}/${item}#${REF}" --yes --overwrite
done < "$ITEMS_FILE"

# Public items can depend on other Hubzz registry entries without carrying the
# candidate ref in source. Reapply every discovered internal dependency at the
# exact candidate ref so a PR smoke test cannot mix candidate files with main.
while IFS= read -r dependency; do
  echo "Reapplying ${dependency} at exact ref ${REF}"
  "$SHADCN" add \
    "${REGISTRY_ADDRESS}/${dependency}#${REF}" \
    --yes \
    --overwrite
done < "$INTERNAL_DEPS_FILE"

grep -q -- "--primary:" src/index.css
grep -q -- "--muted-foreground:" src/index.css

pnpm build

echo "Verified the complete Hubzz registry surface in a clean Vite consumer at ${REF}."
