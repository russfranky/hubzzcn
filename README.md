# Hubzz UI

Public Hubzz design system built on shadcn/ui, Radix primitives, Tailwind CSS,
and a deliberately small Hubzz-owned component layer.

**Catalog:** `https://hubzz.xyz/cn/`

## Install

`hubzzcn` is a public GitHub source registry. A separate registry server is not
required. The shadcn CLI works with npm, pnpm, Yarn, or Bun; examples here use
pnpm because it is the repository toolchain.

Start with the Hubzz base:

```bash
pnpm dlx shadcn@latest add russfranky/hubzzcn/hubzz
```

Apply only the Hubzz theme to an existing shadcn project:

```bash
pnpm dlx shadcn@latest add russfranky/hubzzcn/hubzz-theme
```

Add an individual Hubzz component:

```bash
pnpm dlx shadcn@latest add russfranky/hubzzcn/event-ticket
```

Install the Button override:

```bash
pnpm dlx shadcn@latest add russfranky/hubzzcn/button
```

Registry addresses can be pinned to a release tag or commit when a consumer
needs reproducible source installs.

## Architecture

Hubzz UI uses four decisions in order:

1. Use the upstream shadcn primitive.
2. Theme it with semantic tokens.
3. Add a supported variant or thin composition.
4. Write custom Hubzz source only when the product owns the structure or
   interaction.

That keeps upstream behavior and accessibility work intact while making the
Hubzz layer obvious.

See:

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/FOUNDATIONS.md`](./docs/FOUNDATIONS.md)
- [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md)
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

## Public Hubzz components

The current Hubzz-owned surface is generated from `src/examples/` into
[`docs/COMPONENTS.md`](./docs/COMPONENTS.md). CI verifies that reference with
`pnpm manifest:check`, so it is the human-readable component inventory rather
than a second hand-maintained list here.

Install metadata for those components lives in
[`src/components/hubzz/registry.json`](./src/components/hubzz/registry.json).
To inspect the public registry through the locked toolchain, run:

```bash
pnpm registry:list
```

Ordinary primitives such as Dialog, Select, Sheet, Tabs, Checkbox, Input, and
Tooltip remain upstream-first rather than receiving Hubzz copies in the
registry.

## Package build

The repository also builds a compiled `@hubzz/ui` package artifact. Its public
surface is intentionally limited to that same Hubzz-owned component layer plus
the Button override. It does not re-export ordinary upstream shadcn primitives.
Release tags produce a package tarball on GitHub Releases. The GitHub source
registry is the canonical public distribution path unless a package registry
is explicitly configured later.

```tsx
import { Button, EventTicket } from "@hubzz/ui"
import "@hubzz/ui/styles.css"
```

## Development

Node 22 and pnpm 10.33.4 are the repository baselines.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:ui
pnpm build:preview
```

`pnpm check` enforces formatting, zero-warning lint, TypeScript, generated
component-reference parity, the package build, registry schema validation, and
package-surface validation with publint. Playwright covers browser behavior and
automated accessibility checks.

## Releases

The project follows Semantic Versioning. See
[`docs/RELEASING.md`](./docs/RELEASING.md) and
[`CHANGELOG.md`](./CHANGELOG.md).

## Security

Do not open a public issue for a suspected vulnerability. Follow
[`SECURITY.md`](./SECURITY.md).

## License

Hubzz UI is MIT licensed. See [`LICENSE`](./LICENSE). Source derived from
shadcn/ui retains its upstream notice in
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).
