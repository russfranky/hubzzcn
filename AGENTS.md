# Hubzz UI Agent Guide

This file is the stable entry point for AI-assisted work in this repository.
Read it before making changes. Then read [`docs/WORKING_STATE.md`](./docs/WORKING_STATE.md).

## Canonical project

- Repository: `russfranky/hubzzcn`
- Default branch: `main`
- Working catalog: `https://hubzz-ui-phi.vercel.app/`
- Portal prototype: `https://hubzz-ui-phi.vercel.app/cn/portal`
- Stage prototype: `https://hubzz-ui-phi.vercel.app/cn/stage`
- MQS prototype: `https://hubzz-ui-phi.vercel.app/?prototype=mqs`
- Package name: `@hubzz/ui`
- Node baseline: 22
- pnpm baseline: 10.33.4

Do not treat chat history as the source of truth. Use the repository, merged pull requests, CI, and `docs/WORKING_STATE.md`.

## Domain and release target

On 2026-09-09, Russ dropped the `.xyz` requirement to prioritize product work. This supersedes the `.xyz` decision in PR #88 and the subsequent delivery investigation.

Use the existing `hubzz-ui` Vercel production project and its working URL above. Keep `.github/workflows/deploy-vercel.yml` as the release path. Existing custom-domain aliases may remain, but no domain migration is required.

Do not resume `.xyz`, Cloudflare, Nginx, or DNS work, request credentials for that work, or treat it as a release blocker unless Russ explicitly reopens it. Do not delete or repoint the old site; leaving it alone is intentional.

Report the checked commit and Vercel deployment result. Keep runtime verification distinct from deployment status, but do not require verification on the abandoned `.xyz` target. See [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Start of a work session

1. Read this file.
2. Read `docs/WORKING_STATE.md`.
3. Inspect the latest commits and open pull requests.
4. Confirm the latest `main` CI state before changing code.
5. Check whether shadcn already provides the needed primitive or composition.
6. Create a focused branch from `main` for source changes.

If `docs/WORKING_STATE.md` conflicts with merged code or CI, trust merged code and CI. Update the state file in the next pull request.

## Development rules

Use this order for UI work:

1. Use the upstream shadcn primitive.
2. Theme it with semantic tokens.
3. Add a supported variant or thin composition.
4. Add Hubzz-owned source only for Hubzz-owned structure or interaction.

Keep the published `@hubzz/ui` surface small. Prototype pages do not become package exports unless the change explicitly promotes them.

Do not disable lint, type, accessibility, registry, or package checks to make a change pass. Fix the source when practical.

## Required verification

For normal source changes, run:

```bash
pnpm check
pnpm test:ui
```

For a small documentation-only change, CI can provide the final verification.

Before merge, confirm:

- the pull request diff contains only intended files;
- the quality and registry job passes;
- the browser and accessibility job passes when applicable;
- CodeQL passes;
- no temporary workflows or repair files remain.

## Merge preference

Russ authorized this workflow on 2026-09-08: merge completed `hubzzcn` changes after review and required checks pass. Do not stop at an open PR or ask for another routine merge approval.

This instruction cleared the former review-only hold on PR #76. It does not waive failed checks, unresolved defects, conflicts, repository protections, or a newer explicit hold. It does not authorize indiscriminate merges of unrelated or unreviewed pull requests, or changes to other repositories.

Use a focused PR and verify its exact head SHA before merging. Then verify main-branch CI and the production deployment separately. A successful merge is not proof of a successful deployment. Record the result and any limits in the PR and handoff.

## Handoff rules

Update `docs/WORKING_STATE.md` when a pull request changes any of these items:

- the current focus;
- a prototype route or major feature state;
- a known blocker or constraint;
- the next recommended task;
- a decision that a later session could otherwise repeat.

Keep the state file short. Record durable facts, not a full activity log.

After a task is complete, remove obsolete blockers and move the useful result into the completed section.

## Useful references

- [`README.md`](./README.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md)
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)
- [`docs/WORKING_STATE.md`](./docs/WORKING_STATE.md)
