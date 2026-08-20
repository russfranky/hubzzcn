import * as React from "react"
import { ExternalLink } from "lucide-react"

import { CopyCommand } from "@/catalog/copy-command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { allExamples } from "@/examples"
import type { ComponentLayer, Example, Meta } from "@/examples/types"

type CatalogProps = Record<string, unknown>
type CatalogComponent = React.ComponentType<CatalogProps>
type CatalogMeta = Meta<CatalogComponent>
type CatalogExample = Example<CatalogProps>
type CatalogModule = {
  meta: CatalogMeta
  examples?: CatalogExample[]
} & Record<string, unknown>

const GROUPS: Array<{
  id: string
  layer: ComponentLayer
  eyebrow: string
  title: string
  description: string
}> = [
  {
    id: "overrides",
    layer: "override",
    eyebrow: "Overrides",
    title: "Keep the contract. Change the layer.",
    description:
      "Overrides stay API-compatible with upstream shadcn and exist only when semantic tokens cannot express the Hubzz treatment.",
  },
  {
    id: "components",
    layer: "component",
    eyebrow: "Hubzz components",
    title: "Own only product-specific interface structure.",
    description:
      "These components add reusable Hubzz structure while delegating commodity behavior to upstream primitives wherever possible.",
  },
  {
    id: "patterns",
    layer: "pattern",
    eyebrow: "Patterns",
    title: "Compose primitives into repeatable product patterns.",
    description:
      "Patterns are larger arrangements that receive data and callbacks from the application without owning product services or state.",
  },
]

function isExample(value: unknown): value is CatalogExample {
  if (value === null || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.name === "string" && "args" in candidate
}

function normalizeModule(module: unknown): {
  meta: CatalogMeta
  examples: CatalogExample[]
} {
  const record = module as CatalogModule
  const examples =
    record.examples ??
    Object.entries(record)
      .filter(
        ([key, value]) =>
          key !== "meta" && key !== "examples" && isExample(value)
      )
      .map(([, value]) => value as CatalogExample)

  return { meta: record.meta, examples }
}

const CATALOG = allExamples.map(normalizeModule)

export function Catalog() {
  return (
    <div className="space-y-24">
      {GROUPS.map((group) => {
        const modules = CATALOG.filter(
          ({ meta }) => (meta.layer ?? "component") === group.layer
        )

        if (modules.length === 0) return null

        return (
          <section key={group.id} id={group.id} className="scroll-mt-20">
            <SectionIntro {...group} />
            <div className="space-y-8">
              {modules.map(({ meta, examples }) => (
                <ComponentSection
                  key={meta.title}
                  meta={meta}
                  examples={examples}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8 grid gap-3 border-b border-border pb-7 md:grid-cols-[180px_1fr]">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

function ComponentSection({
  meta,
  examples,
}: {
  meta: CatalogMeta
  examples: CatalogExample[]
}) {
  const slug = meta.slug ?? meta.title.toLowerCase()
  const command = `pnpm dlx shadcn@latest add russfranky/hubzzcn/${slug}`
  const sourceDirectory = meta.category === "shadcn" ? "ui" : "hubzz"
  const sourceUrl = `https://github.com/russfranky/hubzzcn/blob/main/src/components/${sourceDirectory}/${slug}.tsx`

  return (
    <article
      id={slug}
      className="scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card/20"
    >
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">
                {meta.title}
              </h3>
              <Badge variant="secondary" className="text-[9px]">
                beta
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                {meta.category === "shadcn" ? "shadcn override" : "Hubzz-owned"}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {meta.description}
            </p>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Source
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <CopyCommand command={command} className="mt-5 max-w-2xl" />
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        {examples.map((example) => (
          <ExamplePreview key={example.name} meta={meta} example={example} />
        ))}
      </div>

      {meta.notes?.length ? (
        <div className="border-t border-border bg-muted/25 px-5 py-4 sm:px-6">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Contract
          </p>
          <ul className="space-y-1.5">
            {meta.notes.map((note) => (
              <li
                key={note}
                className="text-xs leading-5 text-secondary-foreground"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

function ExamplePreview({
  meta,
  example,
}: {
  meta: CatalogMeta
  example: CatalogExample
}) {
  const rendered = example.render
    ? example.render(example.args)
    : React.createElement(meta.component, example.args)

  return (
    <div className="flex min-h-40 min-w-0 flex-col bg-background p-4 sm:p-5">
      <div className="flex min-h-28 flex-1 items-center justify-center overflow-x-auto rounded-lg border border-dashed border-border bg-card/20 p-4">
        {rendered}
      </div>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground">
        {example.name}
      </p>
    </div>
  )
}
