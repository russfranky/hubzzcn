# Contributing

Thanks for contributing to Hubzz UI. The repository is public infrastructure
for a reusable design system, so changes should optimize for compatibility,
accessibility, and maintainability rather than one-off product needs.

## Before writing code

Use this order of operations:

1. Check whether shadcn already provides the primitive or composition.
2. Prefer tokens and existing variants over a new component.
3. Prefer a thin composition of existing primitives over reimplementing their behavior.
4. Add custom code only when the interaction or structure is genuinely Hubzz-specific.

For upstream components, inspect the current API first:

```bash
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest add <component> --dry-run
```

## Local setup

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Node 22 and pnpm 10.33.4 are the repository defaults. The minimum supported
Node runtime is 20.19.

## Required checks

Before submitting a change:

```bash
pnpm check
pnpm test:ui
```

`pnpm check` covers formatting, linting, TypeScript, the package build,
registry validation, and the package surface.

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

The registry is validated directly from source. Do not commit generated
registry payloads.

```bash
pnpm registry:validate
pnpm registry:list
```

Use `registry:base` for the system foundation, `registry:theme` for tokens,
`registry:ui` for primitive-like overrides, and `registry:component` for
Hubzz-owned reusable source.

## Commit messages

Use Conventional Commit-style prefixes so public history and release notes stay useful:

- `feat:` public capability or component
- `fix:` bug or accessibility fix
- `refactor:` internal change without intentional public behavior changes
- `docs:` documentation only
- `test:` tests only
- `ci:` workflow changes
- `chore:` maintenance

Breaking changes should include `!` in the type or a `BREAKING CHANGE:` footer
and must include migration notes.

## Pull requests

Keep pull requests focused. Explain:

- what changed;
- why the upstream shadcn component was or was not sufficient;
- public API or registry impact;
- accessibility impact;
- how the change was verified.

Do not include secrets, deployment credentials, private infrastructure details,
or unrelated product code.

## Releases

See [`docs/RELEASING.md`](./docs/RELEASING.md) for versioning and tag
requirements.
