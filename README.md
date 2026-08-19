# @hubzz/ui

Hubzz UI system built on shadcn/ui and Radix primitives. Keep upstream behavior where possible, then add Hubzz tokens, variants, and reusable product UI only where the product needs them.

**Live catalog:** `https://hubzz.xyz/cn/`

**Component principles:** see [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md).

## Add with shadcn

`hubzzcn` is a public GitHub source registry. No registry server or namespace configuration is required.

Add the Hubzz theme:

```bash
npx shadcn@latest add russfranky/hubzzcn/hubzz-theme
```

Add the Hubzz Button override:

```bash
npx shadcn@latest add russfranky/hubzzcn/button
```

Registry items use upstream shadcn dependencies whenever possible, so custom Hubzz components do not need to carry copies of every primitive they use.

## Package install

The same system can also be consumed as `@hubzz/ui`:

```bash
npm install @hubzz/ui
```

If you consume the package from GitHub Packages, add the Hubzz package scope to your `.npmrc`:

```text
@hubzz:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Or install directly from a local clone:

```bash
npm install /path/to/hubzzcn
```

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@hubzz/ui"
import "@hubzz/ui/styles.css"

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge>Online</Badge>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## Upstream-first rule

Start with the closest shadcn component:

```bash
npx shadcn@latest add <component>
```

Theme or extend that component before creating a parallel implementation. Use `registryDependencies` for stock primitives and reserve custom source for Hubzz-specific composition or interaction.

## Brand tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #735FFA | Buttons, links, focus rings |
| Background | #181B1F | Dark-first page background |
| Card | #24262B | Panel/card surfaces |
| Control | #393E44 | Neutral controls and hover states |
| Foreground | #FCFDFE | Primary text |
| Muted Foreground | #7C878E | Secondary text |
| Destructive | #D92D20 | Destructive controls |

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run test:ui
npm run build
npm run build:preview
```

`npm run build:preview` produces the production catalog for `hubzz.xyz/cn/`.
