# Working State

Read [`../AGENTS.md`](../AGENTS.md) first. Last reviewed: 2026-09-09.

## Active direction

Use the existing Vercel production site at `https://hubzz-ui-phi.vercel.app/` and its `Deploy Vercel Production` workflow. Russ dropped the `.xyz` requirement. Do not reopen domain, DNS, Cloudflare, or Nginx work without a new explicit request.

Merge completed, reviewed changes after all required checks pass without another routine approval. Preserve checks and protections. Record the exact tested commit and deployment results.

## Completed baseline

- PR #76: product-local Portal and MQS host adapters plus accessible queue list semantics.
- PR #87: clipboard error feedback, retry, timer cleanup, and stale-result protection. Its browser suite passed 220 tests.
- PR #89 merged as `abfe0fef7010b4f233491f080ee39bf7f319974a`: use the existing Vercel site and stop the domain detour. Both jobs in [main CI](https://github.com/russfranky/hubzzcn/actions/runs/34387538898) passed. PR #89 records its successful Vercel deployment.

## Current change

- Branch: `fix/mqs-reorder-boundaries`.
- Goal: prevent invalid queue moves from external drops and end-of-list keyboard actions.
- Source: `src/components/hubzz/mqs-queue-window.tsx`.
- Implemented: queue-local drag token, stable source-item identity, validation against the current host snapshot, cancellation after drop/end/close, and keyboard bounds for both ends of the queue.
- Tests: `tests/mqs-reorder.spec.ts`, included in all three browser projects by `playwright.config.ts`. Existing MQS and accessibility tests remain unchanged.
- Coverage: valid keyboard/pointer moves, focus retention, first/last/single-item bounds, external text/files, invalid/canceled/repeated payloads, descendant drags, window remount, and host snapshot changes.
- Verification and merge status: see the PR for this branch. Do not infer a passed check or completed deployment from this file. Check the live PR state before repeating the fix.

## Next action

Complete this PR's checks, review, merge, and Vercel verification. Then test the demo host's current-item identity during reorder/removal in `src/pages/MqsPrototype.tsx`: its move handler currently changes the item order without adjusting `currentIndex`. Keep that separate from this view-level command-validation fix.

## Product boundaries

- Portal: `/cn/portal`; Stage: `/cn/stage`; MQS: `/?prototype=mqs`, on the working Vercel host.
- The queue view emits host commands; it does not mutate authoritative queue state. Preserve the 1-based move/remove command contract.
- Do not restore the old standalone Loop demo or add prototype code to public package exports or the registry.
- HubzzCN demos do not establish a live server connection. The separate pre-alpha repository did not change.
- Preserve upstream primitives, semantic tokens, keyboard access, and reduced-motion behavior.

## Other work

PR #40 is an older MQS proposal that needs reconciliation with the merged snapshot adapter. Keep dependency PRs separate. Inspect open PRs and their discussions before choosing further work.
