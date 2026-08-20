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

"$SHADCN" add "russfranky/hubzzcn/hubzz#${REF}" --yes --silent
"$SHADCN" add "russfranky/hubzzcn/capsule#${REF}" --yes --silent
"$SHADCN" add "russfranky/hubzzcn/drone-photo#${REF}" --yes --silent
"$SHADCN" add "russfranky/hubzzcn/event-ticket#${REF}" --yes --silent
"$SHADCN" add "russfranky/hubzzcn/profile-header#${REF}" --yes --silent

test -f src/components/hubzz/capsule.tsx
test -f src/components/hubzz/drone-photo.tsx
test -f src/components/hubzz/event-ticket.tsx
test -f src/components/hubzz/profile-header.tsx

pnpm build

echo "Verified Hubzz registry installation in a clean Vite consumer at ${REF}."
