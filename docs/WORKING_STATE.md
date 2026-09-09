# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-09

## Active direction

Russ dropped the `.xyz` requirement on 2026-09-09. Use the existing Vercel deployment and return to product work. This supersedes PR #88's domain requirement and the later `.xyz` repair proposal.

- Working catalog: `https://hubzz-ui-phi.vercel.app/`.
- Release path: the existing `Deploy Vercel Production` workflow for `hubzz-ui`.
- Do not reopen `.xyz`, Cloudflare, Nginx, or DNS work or request credentials for it without a new explicit request.
- Leave the old site and existing domains unchanged. The old site's stale build is no longer a project blocker.

## Completed baseline

- PR #76 merged as `6d5a455`: product-local Portal and MQS host adapters plus accessible queue list semantics.
- PR #87 merged as `6536c18`: clipboard error feedback, retry, timer cleanup, and stale-result protection. Its pre-merge browser suite passed 220 tests. Do not repeat the fix.
- Main at the start of this session was `6aa9798a614ce35801c81c7b7acb5c5a7971609a`. Its [main CI](https://github.com/russfranky/hubzzcn/actions/runs/34298356134), [CodeQL](https://github.com/russfranky/hubzzcn/actions/runs/34298356103), and [Vercel deployment](https://github.com/russfranky/hubzzcn/actions/runs/34298356168) all passed.
- Vercel independently reported production deployment `dpl_9SnVizyipyEhK6QpHL1TBbXyMNJU` READY for that exact SHA. The working catalog URL returned HTTP 200 with the Hubzz UI entry document during this session. This was an HTTP check, not a new live browser test.

## Current focus

Return to focused product fixes. There is no active domain migration or server-access blocker.

The documentation change on `docs/use-existing-vercel-site` replaces the obsolete domain instructions and updates the README catalog link. Its PR records the exact verification and merge results. Check that PR before repeating this update.

## Next product task

Review MQS external drops and end-of-list keyboard reorder cases in `src/components/hubzz/mqs-queue-window.tsx`. Add regression tests in `tests/mqs-prototype.spec.ts`, preserve host command strings and server-owned queue state, run the checks, and merge the focused fix.

## Product boundaries

- Portal: `/cn/portal`; Stage: `/cn/stage`; MQS: `/?prototype=mqs`, on the working Vercel host.
- The MQS host adapter replaced the old standalone Loop demo. Do not restore local queue authority.
- HubzzCN demos do not establish a live server connection. The separate pre-alpha repository did not change.
- Keep upstream primitives, semantic tokens, keyboard access, and reduced-motion behavior. Prototype-only code stays out of public exports unless explicitly promoted.

## Merge policy and other work

Merge completed, reviewed changes after all required checks pass without another routine approval. Preserve checks and protections. Record exact tested commits and deployment results, not assumptions about future runs.

PR #40 remains an older MQS proposal that needs reconciliation with the merged snapshot adapter. Keep dependency PRs separate. Inspect open PRs and their discussions rather than treating an empty issue search as proof that no work remains.
