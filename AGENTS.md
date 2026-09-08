# Hubzz UI Agent Guide

This file is the stable entry point for AI-assisted work in this repository.
Read it before making changes. Then read [`docs/WORKING_STATE.md`](./docs/WORKING_STATE.md).

## Canonical project

- Repository: `russfranky/hubzzcn`
- Default branch: `main`
- Public catalog: `https://hubzz.xyz/cn/`
- Stage prototype: `https://hubzz.xyz/cn/stage`
- Package name: `@hubzz/ui`
- Node baseline: 22
- pnpm baseline: 10.33.4

Do not treat chat history as the source of truth. Use the repository, merged pull requests, CI, and `docs/WORKING_STATE.md`.

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
