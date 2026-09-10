# Working State

Read [`../AGENTS.md`](../AGENTS.md) first. Last reviewed: 2026-09-09.

## Active direction

Use `https://hubzz-ui-phi.vercel.app/` and the existing Vercel release workflow.
Do not reopen domain work. Merge reviewed changes after required checks pass,
without another routine approval. Preserve checks and repository protections.

Russ requested consideration of edge cases. Review empty states, boundaries,
invalid input, ordering, cancellation, recovery, and preserved state for each
change. See [`MQS_EDGE_CASES.md`](./MQS_EDGE_CASES.md) for the MQS contract and
its test matrix. Separate tested behavior from remote integration assumptions.

## Completed baseline

- PR #76: product-local Portal/MQS adapters and accessible queue list semantics.
- PR #87: clipboard error feedback, retry, and stale-result protection.
- PR #89: the existing Vercel site is the working site; no domain migration.
- PR #90 merged as `0f4b880e36cc71af4e575a1ce3e34af8fbd6c512`. Its main CI,
  CodeQL, and Vercel deployment passed. The PR records 265 repository browser
  tests and 45 successful live reorder tests. Do not repeat that repair.

## Current change

Branch: `fix/mqs-state-edge-cases`.

The demo host now uses pure snapshot transitions that preserve active identity
through reorder/removal and define playback behavior at empty/boundary states.
Setlist validation, fresh import IDs, safe timing, file-size limits, latest-read
wins, and unmount cancellation address related edge cases. The view still emits
host commands and never takes ownership of the authoritative queue.

Tests live in `scripts/mqs-demo-state.test.ts` and `tests/mqs-state.spec.ts`.
The state suite is part of `pnpm check`; browser scenarios run in all three
configured engines. Local Node execution passed the state tests. The focused PR
records exact CI, merge, and deployment results; check it before repeating work.

## Next action

Complete the focused PR's verification and merge. Verify the deployed MQS demo,
then use the edge-case contract to choose the next product task. Do not add a
second network state machine or claim real-room synchronization from demo tests.

## Boundaries and other work

Portal is at `/cn/portal`, Stage at `/cn/stage`, and MQS at `/?prototype=mqs`.
The separate pre-alpha repository and public package exports remain unchanged.
Keep the current host command/import ports, upstream primitives, semantic tokens,
keyboard access, and reduced-motion behavior.

PR #40 is an older MQS proposal that needs reconciliation with the current
adapter. Keep dependency PRs separate. Inspect open PR discussions before work.
