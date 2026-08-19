# @hubzz/ui

Hubzz branded shadcn/ui component library. Dark-first design system with the Hubzz purple palette.

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
| Background | #0E0F12 | Page background |
| Card | #1C1E23 | Panel/card surfaces |
| Muted | #2D3039 | Hover states, borders |
| Foreground | #c7d2da | Primary text |
| Card Foreground | #fcfdfe | Highlight text |
| Muted Foreground | #5A6268 | Secondary/muted text |
| Destructive | #FF5A5A | Error states |
| Chart 2 (Success) | #4CC38A | Success indicators |
| Chart 3 (Warning) | #E5B849 | Warning indicators |

## Peer Dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## Adding Components

To add more shadcn components to the library:

```bash
npx shadcn@latest add <component>
```

Then export it from `src/index.ts` and rebuild:

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
