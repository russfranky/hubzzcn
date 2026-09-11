# Working State

Read [`../AGENTS.md`](../AGENTS.md) first. Last reviewed: 2026-09-11.

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

- PR #94 merged as `024fbde9122533ddff1e3bc6a3054815e6dc3578`.
  Main quality, browser, CodeQL, and production-deploy checks passed.
  [MQS focus behavior](./MQS_FOCUS.md) remains the completed baseline.

## Portal consolidation

The owner selected `hubzzcn` as the destination for the Portal UI from
`acre-cinder-cloud-branch`. [PORTAL.md](./PORTAL.md) records the source snapshot,
file organization, retained contracts, and reconciliation decisions.

Portal now composes the shared shadcn primitives with its rooftop scene and
current-space HUD. Its existing URLs, IDs, callback shape, discovery scopes, and
room availability remain canonical. Join closes the Sheet and focus returns to
the elevator. The composition remains catalog-only.

The focused migration PR records validation, exact-head review, merge, and
production deployment evidence. Archiving the source repository depends on that
delivery; the GitHub connector does not expose repository administration.

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
