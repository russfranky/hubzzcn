# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-08

## Current baseline

- PR #76 merged as `6d5a4551529f9251fbb2d4214177f89d21299e1d` after Russ explicitly cleared its former review-only hold.
- Main now includes the Portal and MQS product-local host adapters. The MQS adapter replaces the old standalone Loop demo; do not restore local queue authority by accident.
- Routes in source: `/cn/portal`, `/cn/stage`, and `/cn/?prototype=mqs`.
- The separate pre-alpha repository did not change. HubzzCN demos do not establish a live server connection.
- Public package exports and registry boundaries remain unchanged.

## Deployment targets

- Canonical catalog: `https://hubzz.xyz/cn/`. [`../DEPLOYMENT.md`](../DEPLOYMENT.md) describes a separate Nginx origin behind Cloudflare, with `scripts/deploy-production.sh` publishing the `/cn/` build on that host.
- The automatic Vercel workflow targets `hubzz-ui`. Vercel confirmed commit `6d5a455` READY for production; its aliases include `hubzzhq.com`, not `hubzz.xyz`.
- No evidence in this session confirms that the Nginx host received the merged changes. Vercel success is not proof of an update at `hubzz.xyz/cn/`.
- Do not change DNS, domains, or the canonical URL to conceal this gap. Verify the separate static publication path before claiming the canonical site is current.

## Merge policy

Complete reviewed work through merge after all required checks pass. Do not ask for another routine merge approval. Preserve checks and protections. See `AGENTS.md` for the full policy.

## Latest change

- [PR #87](https://github.com/russfranky/hubzzcn/pull/87), branch `fix/catalog-clipboard-recovery`, resolves the catalog clipboard-feedback defect `DEF-CAT-001` from PR #76.
- Source: `src/catalog/copy-command.tsx`. The change adds existing Sonner error feedback, manual-copy guidance, successful retry cleanup, timer cleanup, and protection against stale async copy results.
- Tests: `tests/catalog-copy.spec.ts` runs in Chromium, Firefox, and WebKit through `playwright.config.ts`.
- Coverage: denied permission, missing clipboard support, retry, success feedback reset, stale failure, and accessibility with the error visible.
- The PR records exact tested heads, merge status, and verification results. Check its live state before resuming the branch; do not repeat a merged fix.

## Verification sources

- PR #76 head `c778f3c`: [CI](https://github.com/russfranky/hubzzcn/actions/runs/34293214591) passed with 205 browser tests; [CodeQL](https://github.com/russfranky/hubzzcn/actions/runs/34293214571) passed.
- Merge `6d5a455`: [main CI](https://github.com/russfranky/hubzzcn/actions/runs/34294867068), [CodeQL](https://github.com/russfranky/hubzzcn/actions/runs/34294867097), and [Vercel deployment](https://github.com/russfranky/hubzzcn/actions/runs/34294867073) passed.
- No local full-suite or live-site visual verification is claimed. The local shell could not resolve GitHub, the web reader could not open the canonical catalog, and Opera was disconnected. CI provides browser evidence.

## Other open work

- PR #40 is an older MQS proposal. Reconcile its intent with the merged snapshot adapter before any merge; it is not automatically safe to combine.
- Dependency PRs remain separate maintenance work. Review and verify each focused update before merging.
- An empty issue search does not mean there is no unfinished work. Inspect open PRs and their discussions.

## Next action

Confirm PR #87 and its main checks completed. Verify the canonical Nginx publication path separately from Vercel. Then review MQS reorder boundary cases, including external drops and keyboard movement at the last row, with regression tests.

## Durable constraints

Keep upstream primitives, semantic tokens, keyboard access, and reduced-motion behavior. Keep prototype-only code out of public exports unless explicitly promoted. Keep production facts separate from unmerged work.
