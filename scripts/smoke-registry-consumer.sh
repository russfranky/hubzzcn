#!/usr/bin/env bash
set -euo pipefail

REF="${1:-${GITHUB_SHA:-main}}"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

cd "$WORKDIR"
pnpm dlx shadcn@latest init \
  --template vite \
  --base radix \
  --name consumer \
  --yes \
  --no-monorepo \
  --silent

cd consumer

pnpm dlx shadcn@latest add "russfranky/hubzzcn/hubzz#${REF}" --yes --silent
pnpm dlx shadcn@latest add "russfranky/hubzzcn/capsule#${REF}" --yes --silent
pnpm dlx shadcn@latest add "russfranky/hubzzcn/drone-photo#${REF}" --yes --silent
pnpm dlx shadcn@latest add "russfranky/hubzzcn/event-ticket#${REF}" --yes --silent
pnpm dlx shadcn@latest add "russfranky/hubzzcn/profile-header#${REF}" --yes --silent

test -f src/components/hubzz/capsule.tsx
test -f src/components/hubzz/drone-photo.tsx
test -f src/components/hubzz/event-ticket.tsx
test -f src/components/hubzz/profile-header.tsx

pnpm build

echo "Verified Hubzz registry installation in a clean Vite consumer at ${REF}."
