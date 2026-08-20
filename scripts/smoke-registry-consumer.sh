#!/usr/bin/env bash
set -euo pipefail

REF="${1:-${GITHUB_SHA:-main}}"
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SHADCN="${REPO_ROOT}/node_modules/.bin/shadcn"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

if [[ ! -x "$SHADCN" ]]; then
  echo "Locked shadcn CLI is unavailable at ${SHADCN}. Run pnpm install --frozen-lockfile first." >&2
  exit 1
fi

cd "$WORKDIR"
"$SHADCN" init \
  --template vite \
  --base radix \
  --name consumer \
  --yes \
  --no-monorepo \
  --silent

cd consumer

items=(
  hubzz
  button
  hubzz-logo
  badge-category
  capsule
  toast-banner
  event-ticket
  profile-header
  drone-photo
)

for item in "${items[@]}"; do
  echo "Installing ${item} at ${REF}"
  "$SHADCN" add "russfranky/hubzzcn/${item}#${REF}" --yes
 done

test -f src/components/ui/button.tsx
test -f src/components/hubzz/hubzz-logo.tsx
test -f src/components/hubzz/badge-category.tsx
test -f src/components/hubzz/capsule.tsx
test -f src/components/hubzz/toast-banner.tsx
test -f src/components/hubzz/event-ticket.tsx
test -f src/components/hubzz/profile-header.tsx
test -f src/components/hubzz/drone-photo.tsx
grep -q -- "--primary:" src/index.css

pnpm build

echo "Verified the complete Hubzz registry surface in a clean Vite consumer at ${REF}."
