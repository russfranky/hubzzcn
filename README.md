# Hubzz UI

[![CI](https://github.com/russfranky/hubzzcn/actions/workflows/ci.yml/badge.svg)](https://github.com/russfranky/hubzzcn/actions/workflows/ci.yml)
[![CodeQL](https://github.com/russfranky/hubzzcn/actions/workflows/codeql.yml/badge.svg)](https://github.com/russfranky/hubzzcn/actions/workflows/codeql.yml)

Hubzz UI is the public Hubzz design system built on shadcn/ui, Radix primitives, Tailwind CSS, and React. The project stays upstream-first: use standard shadcn behavior whenever it fits, theme it with Hubzz tokens, compose primitives for recurring patterns, and write custom UI only when the product actually needs custom structure or interaction.

**Catalog:** https://hubzz.xyz/cn/

> **Status:** pre-1.0. The registry and package APIs are usable, but component coverage and naming may still change before the first stable release.

## Install from the shadcn registry

The public GitHub registry is the primary distribution path. No custom registry server or namespace configuration is required.

### Full Hubzz base

Use this for a new or existing shadcn project that should adopt the complete Hubzz foundation. It pins the Radix-based Hubzz style, tokens, Inter typography, and shared dependencies.

```bash
npx shadcn@latest add russfranky/hubzzcn/hubzz
```

### Theme only

Use this when the project already has its preferred shadcn base and only needs Hubzz design tokens.

```bash
npx shadcn@latest add russfranky/hubzzcn/hubzz-theme
```

### Individual components

```bash
npx shadcn@latest add russfranky/hubzzcn/button
```

Before installing third-party registry code, the shadcn CLI can show the resolved payload or a dry run:

```bash
npx shadcn@latest view russfranky/hubzzcn/button
npx shadcn@latest add russfranky/hubzzcn/button --dry-run
```

For production builds, prefer a released tag once available, for example `russfranky/hubzzcn/button#v0.2.0`, so the installed source is reproducible.

## Package build

The repository also builds the `@hubzz/ui` package for package-based consumption. Public package publishing is intentionally separate from the source-registry release process.

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hubzz/ui"
import "@hubzz/ui/styles.css"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Badge>Online</Badge>
        <Button>Continue</Button>
      </CardContent>
    </Card>
  )
}
```

## Component model

Hubzz UI uses three implementation tiers:

1. **Theme-only primitives** stay as close as possible to upstream shadcn/Radix behavior. Examples include Button, Input, Checkbox, Dialog, Select, Tabs, Sheet, and Dropdown Menu.
2. **Thin compositions** combine those primitives into reusable Hubzz patterns without reimplementing accessible behavior. Examples include search controls, sidebars, profile headers, and menu items.
3. **Custom product UI** is reserved for interaction or structure that is genuinely Hubzz-specific, such as space cards, badge selection, chat surfaces, event tickets, and other product compositions.

See [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) for the decision rules.

## Development

Requirements:

- Node.js 20.19+; Node 22 is the repository default.
- npm.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check              # formatting, lint, types, package build, registry, package surface
npm run test:ui            # Playwright component and accessibility tests
npm run registry:validate  # validate source registry files
npm run registry:list      # list public registry items
npm run registry:view      # inspect the full Hubzz base payload
```

The production catalog is built with:

```bash
npm run build:preview
```

Deployment details are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Compatibility

- React 18 and 19
- Tailwind CSS 4
- shadcn CLI 4
- Radix component base
- TypeScript-first source

The repository intentionally remains on Radix while it is stable and working. The `hubzz` registry base makes that choice explicit for consumers instead of allowing upstream defaults to change it implicitly.

## Repository standards

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — contribution and review expectations
- [`SECURITY.md`](./SECURITY.md) — vulnerability reporting policy
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — community expectations
- [`CHANGELOG.md`](./CHANGELOG.md) — notable public changes
- [`docs/RELEASING.md`](./docs/RELEASING.md) — version and release process
- [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) — shadcn-first component architecture

## Adding a component

Start with upstream before writing custom code:

```bash
npx shadcn@latest docs <component>
npx shadcn@latest add <component>
```

Then apply Hubzz tokens or a thin variant layer. If a new public item is required, add it to the source registry and run `npm run registry:validate` before opening a pull request.
