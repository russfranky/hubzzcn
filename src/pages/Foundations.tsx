import { Badge } from "@/components/ui/badge"

const TOKENS = [
  {
    label: "Background",
    token: "--background",
    description: "Application canvas",
    style: { backgroundColor: "var(--background)" },
  },
  {
    label: "Card",
    token: "--card",
    description: "Raised surfaces",
    style: { backgroundColor: "var(--card)" },
  },
  {
    label: "Primary",
    token: "--primary",
    description: "Primary actions and selected emphasis",
    style: { backgroundColor: "var(--primary)" },
  },
  {
    label: "Secondary",
    token: "--secondary",
    description: "Secondary control surface",
    style: { backgroundColor: "var(--secondary)" },
  },
  {
    label: "Accent",
    token: "--accent",
    description: "Hover and selection surface",
    style: { backgroundColor: "var(--accent)" },
  },
  {
    label: "Border",
    token: "--border",
    description: "Structural separation",
    style: { backgroundColor: "var(--border)" },
  },
  {
    label: "Muted text",
    token: "--muted-foreground",
    description: "Supporting information",
    style: { backgroundColor: "var(--muted-foreground)" },
  },
  {
    label: "Destructive",
    token: "--destructive",
    description: "Destructive actions and errors",
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
    <div className="space-y-24">
      <section id="foundations" className="scroll-mt-20">
        <div className="mb-8 grid gap-3 border-b border-border pb-7 md:grid-cols-[180px_1fr]">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Foundations
          </p>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
              Theme the system before changing components.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Hubzz uses the standard shadcn semantic roles as the customization
              boundary. The catalog and public registry are generated from the
              same CSS token source.
            </p>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {TOKENS.map((token) => (
            <div key={token.token} className="bg-background p-4">
              <div
                className="h-14 rounded-lg border border-border/70"
                style={token.style}
              />
              <p className="mt-4 text-sm font-medium text-foreground">
                {token.label}
              </p>
              <p className="mt-1 font-mono text-[10px] text-secondary-foreground">
                {token.token}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {token.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <FoundationDatum
            label="Type"
            value="Inter Variable"
            detail="One sans family across UI and documentation."
          />
          <FoundationDatum
            label="Radius"
            value="10px base"
            detail="Primitives derive their shadcn radius from one semantic token."
          />
          <FoundationDatum
            label="Theme"
            value="Light + dark"
            detail="The catalog defaults dark; registry semantics stay shadcn-standard."
          />
        </div>
      </section>

      <section id="upstream" className="scroll-mt-20">
        <div className="mb-8 grid gap-3 border-b border-border pb-7 md:grid-cols-[180px_1fr]">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Primitives
          </p>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
              Commodity UI stays upstream.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These are shadcn/Radix building blocks, not parallel Hubzz-owned
              components. Prefer upstream behavior, then tokens, then
              composition.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {UPSTREAM.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="px-3 py-1.5 text-[11px]"
            >
              {name}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}

function FoundationDatum({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-background p-4">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-foreground">{value}</p>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  )
}
