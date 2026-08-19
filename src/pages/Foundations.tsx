import { Badge } from "@/components/ui/badge"

const TOKENS = [
  {
    label: "Background",
    token: "--background",
    value: "#181B1F",
    style: { backgroundColor: "var(--background)" },
  },
  {
    label: "Card",
    token: "--card",
    value: "#24262B",
    style: { backgroundColor: "var(--card)" },
  },
  {
    label: "Accent",
    token: "--accent",
    value: "#393E44",
    style: { backgroundColor: "var(--accent)" },
  },
  {
    label: "Primary",
    token: "--primary",
    value: "#735FFA",
    style: { backgroundColor: "var(--primary)" },
  },
  {
    label: "Foreground",
    token: "--foreground",
    value: "#FCFDFE",
    style: { backgroundColor: "var(--foreground)" },
  },
  {
    label: "Muted",
    token: "--muted-foreground",
    value: "#7C878E",
    style: { backgroundColor: "var(--muted-foreground)" },
  },
  {
    label: "Destructive",
    token: "--destructive",
    value: "#D92D20",
    style: { backgroundColor: "var(--destructive)" },
  },
]

const UPSTREAM = [
  "Alert",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Card",
  "Checkbox",
  "Collapsible",
  "Dialog",
  "Dropdown Menu",
  "Form",
  "Input",
  "Item",
  "Label",
  "Select",
  "Separator",
  "Sheet",
  "Sidebar",
  "Skeleton",
  "Sonner",
  "Switch",
  "Tabs",
  "Textarea",
  "Toggle",
  "Tooltip",
]

export function Foundations() {
  return (
    <div className="space-y-20">
      <section id="foundations" className="scroll-mt-24">
        <div className="mb-8 max-w-2xl">
          <Badge variant="outline">Foundations</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Theme the system before changing the components.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Hubzz uses semantic shadcn tokens as the first customization layer.
            Components consume roles such as primary, card, accent, and ring
            instead of carrying copies of brand values.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOKENS.map((token) => (
            <div
              key={token.token}
              className="overflow-hidden rounded-xl border border-border bg-card/40"
            >
              <div
                className="h-20 border-b border-border"
                style={token.style}
              />
              <div className="p-4">
                <p className="text-sm font-medium text-foreground">
                  {token.label}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {token.token}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {token.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="upstream" className="scroll-mt-24">
        <div className="mb-8 max-w-2xl">
          <Badge variant="outline">Upstream primitives</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Keep commodity UI upstream.
          </h2>
          <p className="mt-3 text-muted-foreground">
            These are shadcn/Radix building blocks, not parallel Hubzz-owned
            components. Hubzz consumes them directly and customizes them through
            the base theme unless a documented override is necessary.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {UPSTREAM.map((name) => (
            <Badge key={name} variant="secondary" className="px-3 py-1.5">
              {name}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
