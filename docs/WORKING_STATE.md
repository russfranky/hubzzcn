# Working State

Read [`../AGENTS.md`](../AGENTS.md) first. Last reviewed: 2026-09-09.

## Active direction

Use `https://hubzz-ui-phi.vercel.app/` and the existing Vercel release workflow.
Do not reopen domain work. Merge reviewed changes after required checks pass,
without another routine approval. Preserve checks and repository protections.

Use the iterative review loop in `AGENTS.md`: find a concrete defect, add tests,
fix it, review the result, and check related boundaries before merge. The MQS
contract is in [`MQS_EDGE_CASES.md`](./MQS_EDGE_CASES.md).

## Completed baseline

- PR #76: product-local Portal/MQS adapters and accessible queue semantics.
- PR #87: clipboard error feedback, retry, and stale-result protection.
- PR #89: use the existing Vercel site; no domain migration.
- PR #90: reject external drops and out-of-range keyboard reorder commands.
- [PR #91](https://github.com/russfranky/hubzzcn/pull/91) merged as
  `9001726ec355a4287c9188f1e7e28fcb2f90e305`. Its main CI, CodeQL, and Vercel
  release passed. The PR records 319 repository browser tests, eight state-test
  groups, and 144 passing live MQS cases. Do not repeat this completed fix.

## Latest improvement

Branch: `fix/mqs-pointer-actions`.

The previously inert grip click now opens a Radix Popover with four move actions.
Native dragging and Alt+Arrow shortcuts remain. The actions use current snapshot
positions, preserve active media and focus, cancel old drags, and handle first,
last, single-item, removed, and replaced rows. The panel fits narrow and short
viewports. Tests include mouse, keyboard, touch emulation, and accessibility.

The focused PR records exact check, merge, deployment, and live-browser results.
Check that PR before repeating the work or treating it as pending. Documentation
of implemented behavior does not substitute for a passing final-head check.

## Next review

Review focus recovery when a keyboard user removes the focused queue row. Add a
failing regression before selecting a successor focus target. Keep it separate
from changes to authoritative playback or remote-server acknowledgement logic.

## Boundaries and other work

Portal is at `/cn/portal`, Stage at `/cn/stage`, and MQS at `/?prototype=mqs`.
The separate pre-alpha repository, package exports, and registry are unchanged.
Keep host command/import ports, upstream primitives, semantic tokens, keyboard
access, and reduced-motion behavior. Demo tests do not prove live-room recovery
or physical-device behavior.

PR #40 is an older MQS proposal that needs reconciliation with the current
adapter. Keep dependency PRs separate. Inspect open PR discussions before work.
