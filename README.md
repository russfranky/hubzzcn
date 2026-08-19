# @hubzz/ui

Hubzz UI system built on shadcn/ui and Radix primitives. The package keeps upstream component behavior where possible and adds Hubzz tokens, variants, and reusable product UI where it is actually needed.

**Component principles:** see [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) for the upstream-first boundary between themed primitives, thin compositions, and custom product UI.

**Design spec:** see [`DESIGN.md`](./DESIGN.md) for tokens, definition of done, and integration patterns.

## Install

```bash
npm install @hubzz/ui
```

If you consume the package from GitHub Packages, add the Hubzz registry to your `.npmrc`:

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

## Components

- Alert, AlertTitle, AlertDescription
- Avatar, AvatarImage, AvatarFallback
- Badge
- Button
- Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
- Checkbox
- Dialog (+ Portal, Overlay, Trigger, Close, Content, Header, Footer, Title, Description)
- Input
- Label
- Select (+ Group, Value, Trigger, Content, Label, Item, Separator)
- Separator
- Sheet (+ Trigger, Close, Content, Header, Footer, Title, Description)
- Switch
- Tabs, TabsList, TabsTrigger, TabsContent
- Textarea
- Toggle

## Utilities

```tsx
import { cn } from "@hubzz/ui"

cn("text-sm", isActive && "text-primary", className)
```

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #735FFA | Hubzz Purple — buttons, links, focus rings |
| Background | #181B1F | Page background |
| Card | #24262B | Panel/card surfaces |
| Control | #393E44 | Control hover and neutral borders |
| Foreground | #FCFDFE | Primary text |
| Muted Foreground | #7C878E | Secondary/muted text |
| Destructive | #D92D20 | Destructive controls |

## Peer Dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## Adding Components

Start with the closest upstream shadcn component:

```bash
npx shadcn@latest add <component>
```

Theme or extend that component before creating a parallel implementation. Then export supported package components from `src/index.ts` and rebuild:

```bash
npm run build
```

## Dev Preview

```bash
npm run dev
```

Opens the component catalog at http://localhost:5173/.

```bash
npm run test:ui          # Playwright: catalog sections + component specs
npm run build:preview    # Production build for hubzz.xyz/cn/
```
