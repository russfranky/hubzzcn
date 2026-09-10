# Working State

Read [`../AGENTS.md`](../AGENTS.md) first. Last reviewed: 2026-09-10.

## Active direction

Use `https://hubzz-ui-phi.vercel.app/` and the existing Vercel release workflow.
Do not reopen domain work. Merge reviewed changes after required checks pass,
without another routine approval. Preserve checks and repository protections.

## Completed baseline

- PR #90 rejects external drops and invalid keyboard reorder positions.
- PR #91 preserves active media and guards queue state and setlist imports.
- PR #92 adds click/tap move actions with keyboard and native drag support.
- PR #93 merged as `2cd9f7ba75dae9b0a50444cbfc74991b669d41c1`. Its settled
  notification accessibility checks passed the 120-case live stress run. Both
  jobs in [post-merge CI](https://github.com/russfranky/hubzzcn/actions/runs/34436327773)
  are now complete and successful. Do not repeat this completed work.

## Current improvement

Branch: `fix/mqs-focus-recovery`.

The new regression first reproduced focused-row removal on the unchanged runtime.
The DOM focus boundary captures actual focus before a committed host update and
recovers to a surviving non-destructive control only after focus becomes invalid.
It covers row removal, disabled transport/seek controls, and portaled actions.

[`MQS_FOCUS.md`](./MQS_FOCUS.md) defines the expected behavior and the test matrix.
The production-demo tests and a Strict Mode controlled-host fixture cover delayed
or rejected commands, batch changes, outside focus, empty queues, two instances,
special-character IDs, and remount. The fixture is development-only, not a new
production route or server integration.

The focused PR records exact baseline failure, final-head checks, review, merge,
and deployment evidence. Read its current state before repeating implementation.

## Next review

Check focus transfer when the demo host closes the entire queue and shows its
Open queue button. This boundary deliberately does not move focus after unmount;
the parent host owns that transition. Confirm the failure before changing it.

## Boundaries and other work

See [`MQS_EDGE_CASES.md`](./MQS_EDGE_CASES.md) for state and pointer contracts.
Host commands, package exports, registry, dependencies, and deployment targets
remain unchanged. Controlled snapshots do not prove real-network recovery,
physical-device behavior, or manual screen-reader compatibility.

PR #40 is an older MQS proposal that needs reconciliation with the current
adapter. Keep dependency PRs separate. Inspect open PR discussions before work.
