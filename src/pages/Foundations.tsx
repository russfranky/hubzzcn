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
              Semantic theme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Standard shadcn semantic roles with Hubzz values. The catalog and
              public registry share the same CSS token source.
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
            detail="Sans type family for interface and catalog text."
          />
          <FoundationDatum
            label="Radius"
            value="10px base"
            detail="Shared shadcn radius token."
          />
          <FoundationDatum
            label="Theme"
            value="Light + dark"
            detail="Dark catalog default with standard registry semantics."
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
              Upstream primitives
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Checked-in shadcn/Radix primitives form the UI substrate.
              Hubzz-specific source is limited to product contracts that differ
              from upstream.
            </p>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <FoundationDatum
            label="Source of truth"
            value="src/components/ui/"
            detail="Checked-in upstream primitive set."
          />
          <FoundationDatum
            label="Composition model"
            value="Upstream → tokens → Hubzz"
            detail="Standard primitive contracts with Hubzz semantic theming and product composition."
          />
          <FoundationDatum
            label="Distribution"
            value="shadcn registry"
            detail="Public registry references upstream items and Hubzz-owned source."
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Hubzz override
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">Button</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              shadcn API with Hubzz geometry, color, focus, and pressed-state
              treatment.
            </p>
          </div>
          <a
            href="#button"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Button reference
            <span aria-hidden="true">→</span>
          </a>
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
