# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-08

## Current baseline

- The public catalog is `https://hubzz.xyz/cn/`.
- PR #76 merged as `6d5a4551529f9251fbb2d4214177f89d21299e1d` after Russ explicitly cleared its former review-only hold.
- Portal and MQS now use product-local host adapters. The MQS adapter replaces the old standalone Loop demo; do not restore local queue authority by accident.
- Routes: `/cn/portal`, `/cn/stage`, and `/cn/?prototype=mqs`.
- The separate pre-alpha repository did not change. HubzzCN demos do not establish a live server connection.
- Public package exports and registry boundaries remain unchanged.

## Merge policy

Complete reviewed work through merge after all required checks pass. Do not ask for another routine merge approval. Preserve checks and protections. See `AGENTS.md` for the full policy.

## Current change

- Goal: resolve the catalog clipboard-feedback defect recorded as `DEF-CAT-001` in PR #76.
- Branch: `fix/catalog-clipboard-recovery`.
- Source: `src/catalog/copy-command.tsx`.
- Added: existing Sonner error feedback, manual-copy guidance, successful retry cleanup, timer cleanup, and protection against stale async copy results.
- Tests: `tests/catalog-copy.spec.ts` runs in Chromium, Firefox, and WebKit through `playwright.config.ts`.
- Coverage: denied permission, missing clipboard support, retry, success feedback reset, stale failure, and accessibility with the error visible.
- Verification: the accompanying PR records the exact tested head and CI results. Check its merge state before resuming this branch.

## Verification sources

- PR #76 head `c778f3c`: [CI](https://github.com/russfranky/hubzzcn/actions/runs/34293214591) passed with 205 browser tests; [CodeQL](https://github.com/russfranky/hubzzcn/actions/runs/34293214571) passed.
- For post-merge status, inspect [main Actions](https://github.com/russfranky/hubzzcn/actions?query=branch%3Amain) for the exact commit. Do not infer deployment success from a PR check.
- No local full-suite or live-site visual verification is claimed for this session. The local shell could not resolve GitHub; the web reader could not open the live catalog. CI provides browser evidence.

## Other open work

- PR #40 is an older MQS proposal. Reconcile its intent with the merged snapshot adapter before any merge; it is not automatically safe to combine.
- Dependency PRs remain separate maintenance work. Review and verify each focused update before merging.
- An empty issue search does not mean there is no unfinished work. Inspect open PRs and their discussions.

## Next action

Confirm the clipboard PR and its main deployment completed. Then review MQS reorder boundary cases, including external drops and keyboard movement at the last row, with regression tests.

## Durable constraints

Keep upstream primitives, semantic tokens, keyboard access, and reduced-motion behavior. Keep prototype-only code out of public exports unless explicitly promoted. Keep production facts separate from unmerged work.
