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
  --preset nova \
  --name consumer \
  --yes \
  --no-monorepo \
  --silent

cd consumer

items=(
  hubzz
  hubzz-theme
  button
  hubzz-logo
  badge-category
  capsule
  toast-banner
  event-ticket
  profile-header
  drone-photo
  avatar-picker
  avatar-carousel
  presence-indicator
  spectator-banner
)

for item in "${items[@]}"; do
  echo "Installing ${item} at ${REF}"
  "$SHADCN" add "russfranky/hubzzcn/${item}#${REF}" --yes --overwrite
done

# Some public items depend on shared Hubzz registry entries without carrying a
# release ref in source. Reapply those shared entries at the exact candidate ref
# so the final consumer cannot silently mix the candidate with default-branch
# source during a PR smoke test.
for foundation in hubzz-theme button hubzz-logo; do
  echo "Reapplying ${foundation} at exact ref ${REF}"
  "$SHADCN" add \
    "russfranky/hubzzcn/${foundation}#${REF}" \
    --yes \
    --overwrite
done

test -f src/components/ui/button.tsx
test -f src/components/hubzz/hubzz-logo.tsx
test -f src/components/hubzz/badge-category.tsx
test -f src/components/hubzz/capsule.tsx
test -f src/components/hubzz/toast-banner.tsx
test -f src/components/hubzz/event-ticket.tsx
test -f src/components/hubzz/profile-header.tsx
test -f src/components/hubzz/drone-photo.tsx
test -f src/components/hubzz/avatar-picker.tsx
test -f src/components/hubzz/avatar-carousel.tsx
test -f src/components/hubzz/presence-indicator.tsx
test -f src/components/hubzz/spectator-banner.tsx
grep -q -- "--primary:" src/index.css
grep -q -- "--muted-foreground:" src/index.css

pnpm build

echo "Verified the complete Hubzz registry surface in a clean Vite consumer at ${REF}."
