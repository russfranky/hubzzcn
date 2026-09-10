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
- PR #91: preserve active media and guard state/import edge cases.
- [PR #92](https://github.com/russfranky/hubzzcn/pull/92) merged as
  `f05b5f01c06a47794be27dc584a13d5d66fed61e`. Click and tap now open bounded
  move actions. Its pre-merge suite passed 379 tests; the deployed MQS suites
  passed 204 cases without retries. The Vercel release is complete.

## Latest verification improvement

Branch: `test/settled-toast-accessibility`.

PR #92's post-merge browser run reported 378 passes and one flaky WebKit import
error contrast scan. It passed on retry, but that is not a clean first-pass run.
The existing scan could sample a partly transparent notification entrance.

The test helper in `tests/helpers/toast.ts` waits for the named notification to
be fully in view, opaque, and settled. Normal pointer hover pauses its expiry
while axe runs. Both MQS import-error and catalog clipboard-error scans use it
and verify the message remains visible after the scan. No application styles,
notification durations, accessibility rules, retries, or exclusions changed.

The focused PR records final-head checks, repeated live test results, merge,
and deployment evidence. Check its current state before repeating the change.

## Next product review

The live baseline inspection in PR #92 confirmed that keyboard removal of the
focused queue row leaves focus on BODY. Add a regression before selecting a
successor focus target. Preserve outside focus and wait for authoritative row
removal rather than moving focus when a host command is merely emitted.

## Boundaries and other work

Portal is at `/cn/portal`, Stage at `/cn/stage`, and MQS at `/?prototype=mqs`.
The separate pre-alpha repository, package exports, and registry are unchanged.
Keep host command/import ports, upstream primitives, semantic tokens, keyboard
access, and reduced-motion behavior. Demo tests do not prove live-room recovery
or physical-device behavior.

PR #40 is an older MQS proposal that needs reconciliation with the current
adapter. Keep dependency PRs separate. Inspect open PR discussions before work.
