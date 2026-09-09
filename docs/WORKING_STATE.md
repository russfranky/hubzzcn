# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-08

## Current baseline

- PR #76 merged as `6d5a4551529f9251fbb2d4214177f89d21299e1d` after Russ cleared its former review-only hold.
- PR #87 merged as `6536c187b0ed4fdbb86194d869d8171b1daad798`. It fixes clipboard error recovery and records the merge-after-checks preference. Do not repeat that fix.
- The post-merge [main CI for `6536c18`](https://github.com/russfranky/hubzzcn/actions/runs/34296149648) passed both Quality and registry and Browser and accessibility. The previously pending browser run is complete.
- Main includes the Portal and MQS product-local host adapters. The MQS adapter replaces the old standalone Loop demo; do not restore local queue authority.
- Routes in source: `/cn/portal`, `/cn/stage`, and `/cn/?prototype=mqs`.
- The separate pre-alpha repository did not change. The demos do not establish a live server connection. Public package exports and registry boundaries remain unchanged.

## Confirmed domain decision

Russ confirmed on 2026-09-08: move forward with `hubzz.xyz`.

- Canonical catalog and release-verification target: `https://hubzz.xyz/cn/`.
- Use `.xyz` in new catalog links, documentation, and release reports. Do not substitute `hubzzhq.com` or a Vercel alias as the canonical target.
- [`../DEPLOYMENT.md`](../DEPLOYMENT.md) describes the existing Nginx origin behind Cloudflare. `scripts/deploy-production.sh` publishes the `/cn/` build on that host.
- The automatic Vercel workflow is separate. PR #87 records its successful deployment evidence, but that does not prove publication to `.xyz`.
- This documentation change does not alter DNS, hosting, workflows, or domain aliases.

## Current focus and blocker

Verify the canonical `.xyz` publication path before claiming the merged code is live there. Publication to the Nginx host and a browser check of the canonical site remain unverified.

The web reader did not return the canonical page in this session. That access failure does not establish a site outage or identify the deployed revision. Keep release claims tied to the checked target and commit.

## Merge policy

Complete reviewed work through merge after all required checks pass. Do not ask for another routine merge approval. Preserve checks and protections. See `AGENTS.md` for the full policy.

## Verification sources

- [PR #87](https://github.com/russfranky/hubzzcn/pull/87) records the clipboard fix, pre-merge checks, and separate Vercel deployment evidence.
- [Main CI for `6536c18`](https://github.com/russfranky/hubzzcn/actions/runs/34296149648) confirms the completed post-merge checks.
- For later commits, inspect the exact commit's [main Actions](https://github.com/russfranky/hubzzcn/actions?query=branch%3Amain). Do not carry an earlier passing result forward to a different revision.
- No live-site visual verification or static-host publication is claimed for this session. CI supplies repository browser-test evidence, not canonical-host evidence.

## Other open work

- PR #40 is an older MQS proposal. Reconcile its intent with the merged snapshot adapter before any merge.
- Keep dependency PRs separate from product and deployment changes.
- Inspect open PRs and their discussions; an empty issue search does not establish that no work remains.

## Next action

Verify the existing `.xyz` host publication using the evidence checklist in `DEPLOYMENT.md`. Keep the domain choice fixed; investigate hosting access or delivery separately. Then review MQS external drops and end-of-list keyboard reorder cases with regression tests.

## Durable constraints

Keep upstream primitives, semantic tokens, keyboard access, and reduced-motion behavior. Keep prototype-only code out of public exports unless explicitly promoted. Keep production facts separate from unmerged work.
