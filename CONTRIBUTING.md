# Contributing

Thanks for contributing to Hubzz UI. The repository is public infrastructure for a reusable design system, so changes should optimize for compatibility, accessibility, and maintainability rather than one-off product needs.

## Before writing code

Use this order of operations:

1. Check whether shadcn already provides the primitive or composition.
2. Prefer tokens and existing variants over a new component.
3. Prefer a thin composition of existing primitives over reimplementing their behavior.
4. Add custom code only when the interaction or structure is genuinely Hubzz-specific.

For upstream components, inspect the current API first:

```bash
npx shadcn@latest docs <component>
npx shadcn@latest add <component> --dry-run
```

## Local setup

```bash
npm install
npm run dev
```

Node 22 is the repository default. The minimum supported development runtime is Node 20.19.

## Required checks

Before submitting a change:

```bash
npm run check
npm run test:ui
```

`npm run check` covers formatting, linting, TypeScript, the package build, registry validation, and the published package surface.

## Component expectations

Public components should:

- use semantic HTML and accessible primitives;
- support keyboard interaction where the control is interactive;
- expose data and callbacks rather than owning product or API state;
- use semantic tokens instead of isolated hard-coded values when a shared token exists;
- retain the standard shadcn API when the upstream abstraction is sufficient;
- include catalog examples for supported states;
- include or update Playwright coverage for behavior that can regress;
- update the source registry when the component is publicly installable.

## Registry changes

The registry is validated directly from source. Do not commit generated registry payloads.

```bash
npm run registry:validate
npm run registry:list
```

Use `registry:base` for the complete system, `registry:theme` for tokens, `registry:ui` for primitive-like components, and `registry:block` or `registry:component` only when the component's structure warrants it.

## Commit messages

Use Conventional Commit-style prefixes so public history and release notes stay useful:

- `feat:` public capability or component
- `fix:` bug or accessibility fix
- `refactor:` internal change without intentional public behavior changes
- `docs:` documentation only
- `test:` tests only
- `ci:` workflow changes
- `chore:` maintenance

Breaking changes should include `!` in the type or a `BREAKING CHANGE:` footer and must include migration notes.

## Pull requests

Keep pull requests focused. Explain:

- what changed;
- why the upstream shadcn component was or was not sufficient;
- public API or registry impact;
- accessibility impact;
- how the change was verified.

Do not include secrets, deployment credentials, private infrastructure details, or unrelated product code.

## Releases

See [`docs/RELEASING.md`](./docs/RELEASING.md) for versioning and tag requirements.
