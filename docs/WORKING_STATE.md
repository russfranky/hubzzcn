# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-06

## Current state

- `main` passed the full CI and production Vercel deployment after PR #84.
- The repository check chain is clean again.
- The public catalog remains at `https://hubzz.xyz/cn/`.
- The Stage HUD prototype is available at `/cn/stage` and `?prototype=stage`.
- The MQS prototype keeps its long-press Loop interaction.
- There are no open product issues recorded in this repository.

## Recently completed

- PR #77 added the Stage HUD prototype without expanding the public `@hubzz/ui` package surface.
- PR #84 restored the repository checks by applying required formatting and moving the MQS item ref write out of render.

## Current focus

No product feature is currently in progress.

Before starting new work, inspect the current catalog and recent pull requests. Choose a focused product or design-system task before editing source.

## Known constraints

- Keep ordinary shadcn primitives upstream-first.
- Keep prototype-only code out of `src/index.ts` unless a change explicitly promotes it to the public package.
- Keep the registry and compiled package surfaces aligned with the documented Hubzz-owned component layer.
- Preserve keyboard and reduced-motion behavior in interactive prototypes.

## Next recommended task

Review the live catalog and prototype routes for the next concrete product need. Record that need here when work starts.

## Handoff format

When active work exists, replace the current-focus section with concise entries for:

- Goal
- Branch or pull request
- Files or subsystem
- What is complete
- What remains
- Verification status
- Next action

Remove stale details after the work merges.
